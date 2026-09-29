import assert from "node:assert/strict";

// Read-only production smoke test. It obtains only the *public* key already
// shipped to visitors and never prints it or requests personal records.
const site = new URL("https://cssilvadev.github.io/portfolio-v2/");
const api = new URL("https://wigksclnaybjqmoktsje.supabase.co/rest/v1/");

async function getText(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(12000) });
  assert.equal(response.status, 200, `Could not load public asset (${response.status})`);
  return response.text();
}

const html = await getText(site);
const scriptPath = html.match(/<script[^>]+src="([^"]+\.js)"/i)?.[1];
assert.ok(scriptPath, "Published JavaScript asset not found");
const scriptUrl = new URL(scriptPath, site);
assert.equal(scriptUrl.origin, site.origin, "Unexpected script origin");
const bundle = await getText(scriptUrl);
const keys = [...new Set(bundle.match(/sb_publishable_[A-Za-z0-9_-]{20,}/g) ?? [])];
assert.equal(keys.length, 1, "Expected exactly one public Supabase key in the published bundle");
const key = keys[0];

async function readOnly(table, query) {
  const url = new URL(table, api);
  url.search = query;
  return fetch(url, {
    headers: { apikey: key, Accept: "application/json" },
    signal: AbortSignal.timeout(12000),
  });
}

const publicEntries = await readOnly("cms_entries", "select=id,published&limit=1000");
assert.equal(publicEntries.status, 200, `Public CMS read failed (${publicEntries.status})`);
const entries = await publicEntries.json();
assert.ok(Array.isArray(entries), "Unexpected public CMS response");
assert.ok(entries.every(entry => entry.published === true), "Unpublished CMS content was visible to anon");

for (const table of ["profiles", "subscriptions", "entitlements", "billing_events", "rate_limit_buckets"]) {
  const response = await readOnly(table, "select=*&limit=1");
  assert.ok([401, 403].includes(response.status), `${table}: anonymous query unexpectedly returned status ${response.status}`);
}

console.log("Live anonymous read-only checks passed: published CMS visible; account and internal tables denied.");
console.log("Not a substitute for tests with authenticated user/admin JWTs or for an independent security audit.");
