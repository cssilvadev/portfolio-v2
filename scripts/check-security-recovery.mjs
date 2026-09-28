import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

// Explicit local snapshot path; no network or production connection.
const snapshotPath = process.argv[2];
assert.ok(snapshotPath, "Usage: node scripts/check-security-recovery.mjs <private-snapshot.json>");
const snapshot = JSON.parse(await readFile(snapshotPath, "utf8"));
assert.equal(snapshot.project_ref, "wigksclnaybjqmoktsje");
assert.deepEqual(snapshot.functions.map(fn => `${fn.schema}.${fn.name}`), ["private.is_admin", "public.consume_rate_limit"]);
assert.deepEqual(snapshot.functions.map(fn => fn.owner), ["postgres", "postgres"]);
const db = await PGlite.create();
const captureSql = await readFile("scripts/security-recovery-snapshot.sql", "utf8");
async function capture() {
  const result = JSON.parse((await db.query(captureSql)).rows[0].recovery_snapshot);
  delete result.captured_at;
  return result;
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
  await db.exec((await readFile("supabase_schema.sql", "utf8")).replace("create extension if not exists pgcrypto;", ""));
  // Reproduce the two captured definitions, not production user records.
  for (const fn of snapshot.functions) await db.exec(fn.definition);
  const before = await capture();
  assert.deepEqual(before.functions, snapshot.functions);
  assert.deepEqual(before.private_schema, snapshot.private_schema);
  await db.query("insert into rate_limit_buckets(key_hash,request_count) values ($1,3)", ["b".repeat(64)]);
  const bucketsBefore = (await db.query("select * from rate_limit_buckets")).rows;
  await db.exec(await readFile("supabase/migrations/202609280001_security_hardening.sql", "utf8"));
  const hardened = await capture();
  assert.ok(hardened.functions[0].definition.includes("'aal2'"));
  assert.deepEqual(hardened.functions[1].configuration, ['search_path=""']);
  await db.exec("begin");
  for (const fn of snapshot.functions) await db.exec(fn.definition);
  await db.exec("commit");
  assert.deepEqual(await capture(), before);
  assert.deepEqual((await db.query("select * from rate_limit_buckets")).rows, bucketsBefore);
  console.log("Local recovery verified: captured definitions/grants restored; policies, triggers, RLS and fixture data unchanged. NOT a full backup; nothing applied to production.");
} finally {
  await db.close();
}
