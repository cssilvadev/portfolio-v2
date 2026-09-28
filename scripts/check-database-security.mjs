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
  await db.exec(await readFile("supabase/migrations/202609280001_security_hardening.sql", "utf8"));
  await db.query("insert into auth.users(id, email, raw_user_meta_data) values ($1,'a@example.invalid', '{\"role\":\"admin\",\"subscription_tier\":\"lifetime\"}'), ($2,'b@example.invalid','{}'), ($3,'admin@example.invalid','{}')", [userA, userB, adminId]);
  await equal((await db.query("select role, subscription_tier from profiles where id=$1", [userA])).rows, [{ role: "user", subscription_tier: "free" }]);
  await db.query("update profiles set role='admin' where id=$1", [adminId]);
  await db.query("insert into cms_entries(id,kind,slug,published) values ($1,'article','public-note',true),($2,'article','private-draft',false)", [publicId, draftId]);
  await db.query("insert into cms_entry_translations(entry_id,language,title) values ($1,'en','Public'),($2,'en','Private')", [publicId, draftId]);
  await db.exec("grant all on all tables in schema public to service_role");
  await db.query("insert into subscriptions(user_id,plan_id,status) select $1::uuid,id,'active' from billing_plans where slug='pro-monthly' union all select $2::uuid,id,'active' from billing_plans where slug='pro-monthly'", [userA, userB]);
  await db.query("insert into entitlements(user_id,plan_id,source,status) select $1::uuid,id,'admin_grant','active' from billing_plans where slug='pro-monthly' union all select $2::uuid,id,'admin_grant','active' from billing_plans where slug='pro-monthly'", [userA, userB]);

  await identity("anon");
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
