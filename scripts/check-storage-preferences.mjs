import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { runInNewContext } from "node:vm";
import { createServer } from "vite";

const server = await createServer({ envDir: false, server: { middlewareMode: true }, appType: "custom" });
let assertions = 0;
const equal = (actual, expected) => { assert.deepEqual(actual, expected); assertions++; };
const storage = (entries = {}) => {
  const values = new Map(Object.entries(entries));
  const writes = [];
  return { values, writes, getItem: key => values.get(key) ?? null, setItem: (key, value) => { writes.push(["set", key]); values.set(key, value); }, removeItem: key => { writes.push(["remove", key]); values.delete(key); } };
};
try {
  const { parseStorageChoices, readStoragePreferences, writeStorageChoices, persistPreference, storageKeys } = await server.ssrLoadModule("/src/utils/storagePreferences.ts");
  const off = { version: 1, rememberTheme: false, rememberLanguage: false };
  const on = { version: 1, rememberTheme: true, rememberLanguage: true };
  const fresh = storage();
  equal(readStoragePreferences(fresh).choices, off);
  equal(fresh.writes, []); // A visit must not silently save optional preferences.
  equal(readStoragePreferences().available, false);
  for (const value of [null, "bad json", "{}", "null", '{"version":2,"rememberTheme":true,"rememberLanguage":true}', '{"version":1,"rememberTheme":"false","rememberLanguage":true}']) equal(parseStorageChoices(value), undefined);
  equal(parseStorageChoices(JSON.stringify(off)), off);
  const existing = storage({ theme: "light", portfolio_lang: "pt" });
  equal(readStoragePreferences(existing).choices, on);
  equal(readStoragePreferences(existing).theme, "light");
  equal(readStoragePreferences(existing).language, "pt");
  equal(existing.writes, []); // Preserve legacy preferences without automatic writes.
  const declined = storage({ theme: "light", portfolio_lang: "pt", portfolio_storage_choices: JSON.stringify(off) });
  equal(readStoragePreferences(declined).theme, "dark");
  equal(readStoragePreferences(declined).language, undefined);
  equal(persistPreference(declined, "theme", "light", false), true);
  equal(declined.getItem("theme"), null);

  // Dummy strings, not real auth tokens. Neither authentication nor unrelated
  // applications may be affected by the preference-cleanup operation.
  const shared = storage({ theme: "light", portfolio_lang: "pt", "sb-fixture-auth-token": "fixture-only", "another-app": "keep" });
  equal(writeStorageChoices(shared, off, "light", "pt"), true);
  equal(shared.getItem("theme"), null);
  equal(shared.getItem("portfolio_lang"), null);
  equal(shared.getItem("sb-fixture-auth-token"), "fixture-only");
  equal(shared.getItem("another-app"), "keep");
  equal(JSON.parse(shared.getItem(storageKeys.choices)), off);
  equal(writeStorageChoices(shared, on, "light", "es"), true);
  equal(readStoragePreferences(shared).theme, "light");
  equal(readStoragePreferences(shared).language, "es");
  equal(writeStorageChoices(shared, { ...on, rememberTheme: false }, "light", "es"), true);
  equal(shared.getItem("theme"), null);
  equal(shared.getItem("portfolio_lang"), "es");
  equal(persistPreference(shared, "language", "pt", true), true);
  equal(shared.getItem("portfolio_lang"), "pt");
  const blocked = { getItem() { throw new Error("blocked"); }, setItem() { throw new Error("blocked"); }, removeItem() { throw new Error("blocked"); } };
  equal(readStoragePreferences(blocked).available, false);
  equal(writeStorageChoices(blocked, off, "dark", "en"), false);
  equal(persistPreference(blocked, "theme", "light", true), false);
  equal(persistPreference(undefined, "theme", "light", false), false);

  // Execute the actual pre-CSS theme bootstrap in an isolated VM, not a browser
  // session. It must agree with React on legacy, declined, corrupt and blocked data.
  const bootstrap = (await readFile("index.html", "utf8")).match(/<script>([\s\S]*?)<\/script>/)[1];
  for (const fixture of [fresh, existing, declined, storage({ theme: "light", portfolio_storage_choices: "bad json" }), storage({ theme: "light", portfolio_storage_choices: JSON.stringify({ ...off, version: 2 }) }), blocked]) {
    const attributes = new Map();
    runInNewContext(bootstrap, { localStorage: fixture, document: { documentElement: { setAttribute: (name, value) => attributes.set(name, value) }, querySelector: selector => ({ setAttribute: (_, value) => attributes.set(selector, value) }) } });
    const theme = readStoragePreferences(fixture).theme;
    equal(attributes.get("data-theme"), theme);
    equal(attributes.get('meta[name="color-scheme"]'), theme === "light" ? "only light" : "dark");
  }
  const { endLocalSession } = await server.ssrLoadModule("/src/utils/session.ts");
  const calls = [];
  await endLocalSession({ auth: { signOut: async options => { calls.push(options); return { error: null }; } } });
  equal(calls, [{ scope: "local" }]);
  await assert.rejects(endLocalSession({ auth: { signOut: async () => ({ error: new Error("fixture failure") }) } })); assertions++;
  console.log(`Storage preferences: ${assertions} assertions passed (opt-in, legacy migration, exact-key cleanup, blocked storage, bootstrap and local logout). No real accounts or tokens used.`);
} finally { await server.close(); }
