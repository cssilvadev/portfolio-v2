import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

// Real PostgreSQL engine in an ephemeral local database. No production requests.
// Auth identity is a fixture; this does NOT test Supabase's JWT verification.
const db = await PGlite.create();
const userA = "11111111-1111-4111-8111-111111111111";
const userB = "22222222-2222-4222-8222-222222222222";
const adminId = "33333333-3333-4333-8333-333333333333";
const publicId = "44444444-4444-4444-8444-444444444444";
const draftId = "55555555-5555-4555-8555-555555555555";
let assertions = 0;
async function equal(actual, expected) { assert.deepEqual(actual, expected); assertions++; }
async function denied(sql, params = []) { await assert.rejects(db.query(sql, params)); assertions++; }
async function identity(role, sub = null, aal = "aal1") {
  await db.exec("reset role");
  await db.query("select set_config('request.jwt.claims', $1, false)", [JSON.stringify({ sub, aal })]);
  assert.ok(["anon", "authenticated", "service_role"].includes(role));
  await db.exec(`set role ${role}`);
}
try {
  await db.exec(`
    create role anon; create role authenticated; create role service_role bypassrls;
    create schema auth;
    create table auth.users(id uuid primary key, email text, raw_user_meta_data jsonb default '{}');
    create function auth.jwt() returns jsonb language sql stable as $$
      select coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb
    $$;
    create function auth.uid() returns uuid language sql stable as $$ select (auth.jwt()->>'sub')::uuid $$;
    grant usage on schema auth, public to anon, authenticated, service_role;
    grant execute on function auth.jwt(), auth.uid() to anon, authenticated, service_role;
  `);
  // PGlite has gen_random_uuid in core, but not the optional pgcrypto extension.
  const schema = (await readFile("supabase_schema.sql", "utf8")).replace("create extension if not exists pgcrypto;", "");
  await db.exec(schema);
  // The production preflight exports configuration only, and must work read-only.
  await db.exec("begin read only");
  const recovery = JSON.parse((await db.query(await readFile("scripts/security-recovery-snapshot.sql", "utf8"))).rows[0].recovery_snapshot);
  await db.exec("rollback");
  await equal(recovery.project_ref, "wigksclnaybjqmoktsje");
  await equal(recovery.functions.map(fn => `${fn.schema}.${fn.name}`), ["private.is_admin", "public.consume_rate_limit"]);
  await equal(recovery.functions.every(fn => fn.definition.startsWith("CREATE OR REPLACE FUNCTION") && fn.owner && fn.acl && Array.isArray(fn.grants)), true);
  await equal(recovery.private_schema.grants.some(grant => grant.grantee === "authenticated" && grant.privilege === "USAGE"), true);
  await equal(recovery.table_security.length, 4);
  await equal(recovery.table_security.every(table => table.rls_enabled), true);
  await equal(recovery.policies.some(policy => policy.policyname === "Admins can update CMS entries"), true);
  await equal(recovery.profile_triggers.some(trigger => trigger.name === "protect_profile_fields"), true);
  await db.exec(await readFile("supabase/migrations/202609280001_security_hardening.sql", "utf8"));
  // Also verify the migration works on a fresh schema without legacy triggers.
  await db.exec(await readFile("supabase/migrations/202609280002_least_privilege.sql", "utf8"));
  await db.exec(`
    create function public.prevent_client_billing_changes() returns trigger language plpgsql
    security definer set search_path = 'public' as $$
    begin
      if auth.uid() is not null and (
        new.subscription_tier is distinct from old.subscription_tier or
        new.stripe_customer_id is distinct from old.stripe_customer_id
      ) then raise exception 'Billing fields are server-managed'; end if;
      new.updated_at = timezone('utc'::text, now());
      return new;
    end; $$;
    create trigger protect_profile_billing_fields before update on public.profiles
    for each row execute function public.prevent_client_billing_changes();
  `);
  // Reproduce the excessive legacy grants observed on the real project.
  await db.exec("grant all on public.billing_plans, public.cms_entries, public.cms_entry_translations, public.profiles, public.subscriptions, public.entitlements to anon, authenticated");
  await db.exec("grant execute on function public.handle_new_user(), public.prevent_client_billing_changes(), public.prevent_client_protected_profile_changes(), public.touch_updated_at() to public, anon, authenticated, service_role");
  await db.exec(await readFile("supabase/migrations/202609280002_least_privilege.sql", "utf8"));
  const accessReview = JSON.parse((await db.query(await readFile("scripts/security-access-review.sql", "utf8"))).rows[0].access_review);
  await equal(accessReview.tables_and_views.every(table => table.rls && !table.anon_write && !table.authenticated_ddl), true);
  await equal(accessReview.tables_and_views.filter(table => table.anon_read).map(table => table.name), ["billing_plans", "cms_entries", "cms_entry_translations"]);
  await equal(accessReview.schemas.every(schema => !schema.anon_create && !schema.authenticated_create), true);
  await equal(accessReview.functions.filter(fn => fn.return_type === "trigger").every(fn => !fn.anon_execute && !fn.authenticated_execute && fn.configuration[0] === 'search_path=""'), true);
  // Idempotent: reapplication must not expand privileges or replace data/policies.
  await db.exec(await readFile("supabase/migrations/202609280002_least_privilege.sql", "utf8"));
  await equal(JSON.parse((await db.query(await readFile("scripts/security-access-review.sql", "utf8"))).rows[0].access_review), accessReview);
  await db.query("insert into auth.users(id, email, raw_user_meta_data) values ($1,'a@example.invalid', '{\"role\":\"admin\",\"subscription_tier\":\"lifetime\"}'), ($2,'b@example.invalid','{}'), ($3,'admin@example.invalid','{}')", [userA, userB, adminId]);
  await equal((await db.query("select role, subscription_tier from profiles where id=$1", [userA])).rows, [{ role: "user", subscription_tier: "free" }]);
  await db.query("update profiles set role='admin' where id=$1", [adminId]);
  await db.query("insert into cms_entries(id,kind,slug,published) values ($1,'article','public-note',true),($2,'article','private-draft',false)", [publicId, draftId]);
  await db.query("insert into cms_entry_translations(entry_id,language,title) values ($1,'en','Public'),($2,'en','Private')", [publicId, draftId]);
  await db.exec("grant all on all tables in schema public to service_role");
  await db.query("insert into subscriptions(user_id,plan_id,status) select $1::uuid,id,'active' from billing_plans where slug='pro-monthly' union all select $2::uuid,id,'active' from billing_plans where slug='pro-monthly'", [userA, userB]);
  await db.query("insert into entitlements(user_id,plan_id,source,status) select $1::uuid,id,'admin_grant','active' from billing_plans where slug='pro-monthly' union all select $2::uuid,id,'admin_grant','active' from billing_plans where slug='pro-monthly'", [userA, userB]);

  await identity("anon");
  await denied("truncate cms_entries cascade");
  await denied("select public.handle_new_user()");
  await equal((await db.query("select slug from cms_entries")).rows, [{ slug: "public-note" }]);
  await equal((await db.query("select title from cms_entry_translations")).rows, [{ title: "Public" }]);
  await denied("select * from profiles");
  await denied("select * from subscriptions");
  await denied("select * from entitlements");
  await equal((await db.query("select * from billing_plans")).rows, []);
  await denied("select * from billing_events");
  await denied("select * from rate_limit_buckets");
  await denied("insert into cms_entries(kind,slug) values ('article','unauthorized')");
  await denied("select * from consume_rate_limit($1,60,5)", ["a".repeat(64)]);

  await identity("authenticated", userA);
  await denied("truncate profiles cascade");
  await denied("select public.prevent_client_protected_profile_changes()");
  await equal((await db.query("select id from profiles")).rows, [{ id: userA }]);
  await equal((await db.query("select id from profiles where id=$1", [userB])).rows, []);
  for (const table of ["subscriptions", "entitlements"]) {
    await equal((await db.query(`select user_id from ${table}`)).rows, [{ user_id: userA }]);
    await denied(`update ${table} set status='active' where user_id=$1`, [userA]);
    await denied(`delete from ${table} where user_id=$1`, [userA]);
  }
  await equal((await db.query("update profiles set full_name='User B' where id=$1 returning id", [userB])).rows, []);
  await db.query("update profiles set full_name='Allowed' where id=$1", [userA]);
  for (const [field, value] of [["role", "admin"], ["subscription_tier", "lifetime"], ["stripe_customer_id", "cus_fake"], ["email", "other@example.invalid"]]) {
    await denied(`update profiles set ${field}=$1 where id=$2`, [value, userA]);
  }
  await denied("insert into profiles(id) values ($1)", ["66666666-6666-4666-8666-666666666666"]);
  await denied("insert into cms_entries(kind,slug) values ('article','user-write')");
  await equal((await db.query("update cms_entries set published=true where id=$1 returning id", [draftId])).rows, []);
  await equal((await db.query("delete from cms_entries where id=$1 returning id", [publicId])).rows, []);
  await denied("select * from consume_rate_limit($1,60,5)", ["a".repeat(64)]);

  await identity("authenticated", userB);
  await equal((await db.query("select id from profiles")).rows, [{ id: userB }]);
  await equal((await db.query("select id from profiles where id=$1", [userA])).rows, []);
  for (const table of ["subscriptions", "entitlements"]) await equal((await db.query(`select user_id from ${table}`)).rows, [{ user_id: userB }]);
  await identity("authenticated", adminId, "aal1");
  await equal((await db.query("select slug from cms_entries")).rows, [{ slug: "public-note" }]);
  await denied("insert into cms_entries(kind,slug) values ('article','admin-without-mfa')");
  await identity("authenticated", adminId, "aal2");
  await equal((await db.query("select count(*)::int as count from cms_entries")).rows, [{ count: 2 }]);
  await db.query("insert into cms_entries(kind,slug,created_by) values ('article','admin-with-mfa',$1)", [adminId]);
  await equal((await db.query("update cms_entries set date_label='updated' where id=$1 returning id", [draftId])).rows, [{ id: draftId }]);

  await identity("service_role");
  const key = "a".repeat(64);
  for (let attempt = 1; attempt <= 5; attempt++) await equal((await db.query("select * from consume_rate_limit($1,60,5)", [key])).rows, [{ allowed: true, retry_after_seconds: 0 }]);
  const blocked = (await db.query("select * from consume_rate_limit($1,60,5)", [key])).rows;
  await equal(blocked.length, 1); await equal(blocked[0].allowed, false);
  assert.ok(blocked[0].retry_after_seconds > 0 && blocked[0].retry_after_seconds <= 60); assertions++;
  await db.query("update rate_limit_buckets set window_started_at=now()-interval '61 seconds' where key_hash=$1", [key]);
  await equal((await db.query("select * from consume_rate_limit($1,60,5)", [key])).rows, [{ allowed: true, retry_after_seconds: 0 }]);
  await equal((await db.query("select request_count from rate_limit_buckets where key_hash=$1", [key])).rows, [{ request_count: 1 }]);
  for (const params of [[null,60,5], ["not-a-hash",60,5], [key,null,5], [key,0,5], [key,60,null], [key,60,0]]) await denied("select * from consume_rate_limit($1,$2,$3)", params);
  console.log(`Database security: ${assertions} assertions passed (anonymous, user A/B, protected fields, MFA admin, rate limit). Local fixtures only.`);
} finally { await db.close(); }
