import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
let documents = 0;
async function visit(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) { await visit(filename); continue; }
    assert.ok(!entry.name.endsWith(".map"), `Source maps must not be published: ${filename}`);
    if (!/\.(html|js|json)$/.test(entry.name)) continue;
    const value = await readFile(filename, "utf8");
    assert.ok(!/sb_secret_[A-Za-z0-9_-]{16,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|sk_(?:live|test)_[A-Za-z0-9]{16,}/.test(value), `Private key pattern in ${filename}`);
    for (const token of value.matchAll(/eyJ[A-Za-z0-9_-]+\.([A-Za-z0-9_-]+)\.[A-Za-z0-9_-]+/g)) {
      let claims;
      try { claims = JSON.parse(Buffer.from(token[1], "base64url").toString()); } catch { continue; }
      assert.notEqual(claims.role, "service_role", `Privileged JWT in ${filename}`);
    }
    if (!entry.name.endsWith(".html")) continue;
    const policy = value.match(/http-equiv="Content-Security-Policy" content="([^"]+)"/)?.[1];
    assert.ok(policy, `Missing CSP: ${filename}`);
    const scriptPolicy = policy.split(";").find(item => item.trim().startsWith("script-src "));
    assert.ok(scriptPolicy && !scriptPolicy.includes("'unsafe-inline'") && !scriptPolicy.includes("'unsafe-eval'"));
    for (const directive of ["object-src 'none'", "base-uri 'none'", "form-action 'none'", "script-src-attr 'none'"]) assert.ok(policy.includes(directive));
    assert.ok(value.includes('<meta name="referrer" content="no-referrer"'));
    assert.ok(value.indexOf('http-equiv="Content-Security-Policy"') < value.indexOf("<script"));
    for (const script of value.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
      if (/\bsrc\s*=|type=["']application\/(?:ld\+)?json["']/i.test(script[1])) continue;
      assert.ok(scriptPolicy.includes(`'sha256-${createHash("sha256").update(script[2]).digest("base64")}'`), `Unauthorized inline script: ${filename}`);
    }
    documents++;
  }
}
await visit("dist");
console.log(`Publication security passed: ${documents} documents, CSP hashes, no-referrer, secret patterns and no source maps.`);
