import { readFile, writeFile, readdir } from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { createServer } from "vite";

const server = await createServer({ envDir: false, server: { middlewareMode: true }, appType: "custom" });
try {
  const { publicSupabaseOrigin } = await server.ssrLoadModule("/src/lib/supabase.ts");
  const { captchaSiteKey, activeContactEndpoint } = await server.ssrLoadModule("/src/lib/securityConfig.ts");
  const directives = {
    "default-src": "'none'",
    "script-src": `'self'${captchaSiteKey ? " https://challenges.cloudflare.com" : ""}`,
    "script-src-attr": "'none'",
    // Scroll-driven CSS variables and React inline styles are intentional.
    "style-src": "'self' 'unsafe-inline'",
    "img-src": "'self' data: https:",
    "font-src": "'self'",
    "connect-src": `'self' ${publicSupabaseOrigin} ${publicSupabaseOrigin.replace(/^https:/, "wss:")}${activeContactEndpoint ? " https://formspree.io" : ""}${captchaSiteKey ? " https://challenges.cloudflare.com" : ""}`,
    "frame-src": captchaSiteKey ? "https://challenges.cloudflare.com" : "'none'",
    "object-src": "'none'",
    "base-uri": "'none'",
    // Forms require JavaScript. Never allow personal fields in a native GET/POST.
    "form-action": "'none'",
    "upgrade-insecure-requests": "",
  };
  let count = 0;
  async function visit(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const filename = path.join(directory, entry.name);
      if (entry.isDirectory()) { await visit(filename); continue; }
      if (!entry.name.endsWith(".html")) continue;
      let html = await readFile(filename, "utf8");
      const hashes = new Set();
      for (const script of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
        if (/\bsrc\s*=|type=["']application\/(?:ld\+)?json["']/i.test(script[1])) continue;
        hashes.add(`'sha256-${createHash("sha256").update(script[2]).digest("base64")}'`);
      }
      const policy = Object.entries({ ...directives, "script-src": `${directives["script-src"]} ${[...hashes].join(" ")}` })
        .map(([name, value]) => `${name}${value ? ` ${value.trim()}` : ""}`).join("; ");
      html = html.replace(/<meta\s+(?:http-equiv="Content-Security-Policy"|name="referrer")[^>]*>/gi, "");
      if (!/<meta charset="[^"]+"\s*\/?>/i.test(html)) throw new Error(`Missing charset: ${filename}`);
      html = html.replace(/(<meta charset="[^"]+"\s*\/?>)/i, `$1\n<meta http-equiv="Content-Security-Policy" content="${policy}" />\n<meta name="referrer" content="no-referrer" />`);
      await writeFile(filename, html);
      count++;
    }
  }
  await visit("dist");
  console.log(`Browser CSP and no-referrer policy added to ${count} HTML documents. GitHub Pages does not support custom security response headers.`);
} finally { await server.close(); }
