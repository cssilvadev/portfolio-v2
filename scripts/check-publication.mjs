import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { createServer } from "vite";

const server = await createServer({ envDir: false, server: { middlewareMode: true }, appType: "custom" });
try {
  const { pedalResponse } = await server.ssrLoadModule("/src/utils/pedal.ts");
  const { extractHeadings } = await server.ssrLoadModule("/src/utils/headings.ts");
  const { routeMeta } = await server.ssrLoadModule("/src/utils/seo.ts");
  const { getNoteConnection } = await server.ssrLoadModule("/src/data/editorial.ts");
  const { projects } = await server.ssrLoadModule("/src/data/projects.ts");
  const { notes, loadNoteBySlug } = await server.ssrLoadModule("/src/data/notes.ts");
  assert.equal(pedalResponse(0, .08, 1.5), 0);
  assert.equal(pedalResponse(.08, .08, 1.5), 0);
  assert.equal(pedalResponse(1, .08, 1.5), 1);
  assert.equal(pedalResponse(2, .08, 1.5), 1);
  assert.equal(pedalResponse(-1, .08, 1.5), 0);
  assert.ok(Math.abs(pedalResponse(.5, .08, 1.5) - .308457) < .00001);
  for (const deadzone of [0, .08, .3]) for (const gamma of [.5, 1, 1.5, 3]) {
    let previous = 0;
    for (let input = 0; input <= 100; input++) {
      const output = pedalResponse(input / 100, deadzone, gamma);
      assert.ok(output >= previous && output >= 0 && output <= 1);
      previous = output;
    }
  }
  const headings = extractHeadings("## Visão geral\n## Visão geral\n```\n## not a heading\n```\n### Controle");
  assert.deepEqual(headings.map(item => item.id), ["visao-geral", "visao-geral-2", "controle"]);
  assert.equal(routeMeta("/projects/jarvis/", "en", projects, notes).canonical, "https://cssilvadev.github.io/portfolio-v2/projects/jarvis/");
  assert.equal(routeMeta("/admin", "en", projects, notes).indexable, false);
  assert.deepEqual(getNoteConnection("a-new-note", ["format:build-log", "project:jarvis", "project:jarvis"]), { format: "build-log", projects: ["jarvis"] });
  assert.deepEqual(getNoteConnection("jarvis-local-ai-hud", ["project:none"]), { format: "article", projects: [] });
  for (const language of ["en", "pt", "es"]) {
    const note = await loadNoteBySlug("pedal-response-bench-note", language);
    assert.ok(note.content.includes("## ") && note.content.includes("```typescript"));
    assert.ok(note.readingTime > 0);
  }
  const manifest = JSON.parse(await readFile("dist/route-manifest.json", "utf8"));
  const titles = new Set();
  for (const route of manifest.routes) {
    const html = await readFile(path.join("dist", route.path, "index.html"), "utf8");
    const title = html.match(/<title>(.*?)<\/title>/s)?.[1];
    assert.ok(title, `Missing title: ${route.path}`);
    assert.ok(html.includes(`<link rel="canonical" href="${route.url}"`), `Canonical mismatch: ${route.path}`);
    assert.ok(html.includes('id="main-content"') && html.includes("<h1"), `Missing readable initial HTML: ${route.path}`);
    if (route.path !== "admin") assert.ok(html.includes('data-prerender="true"'), "The actual page layout must be rendered");
    if (route.path !== "admin") assert.ok(html.includes("Storage settings</button>"), "Storage controls must be discoverable on public routes");
    // Actual key/JWT patterns are checked by check-publication-security.mjs;
    // documentation may legitimately discuss the names of privileged roles.
    assert.doesNotThrow(() => JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1] ?? ""));
    const snapshot = JSON.parse(html.match(/<script id="published-content" type="application\/json">([\s\S]*?)<\/script>/)?.[1] ?? "");
    assert.ok(snapshot.projects.length > 0 && snapshot.notes.length > 0);
    if (route.path !== "admin") {
      assert.ok(!titles.has(title), `Duplicate title: ${title}`);
      titles.add(title);
    }
    // All bundled scripts referenced by every deep page must exist.
    for (const match of html.matchAll(/(?:src|href)="\/portfolio-v2\/(assets\/[^"?]+)"/g)) assert.ok((await stat(path.join("dist", match[1]))).isFile());
  }
  const home = await readFile("dist/index.html", "utf8");
  if (home.includes('data-contact-mode="form"')) {
    assert.ok(/<form[^>]*class="contact-form"[^>]*method="post"/.test(home), "Contact data must never fall back to GET query parameters");
    assert.ok(/<button type="submit" disabled=""/.test(home), "Contact submission requires the client handler to be ready");
  } else {
    assert.ok(home.includes('data-contact-mode="email"') && home.includes('href="mailto:christiansilva.dev@outlook.com"'), "Unconfigured contact must offer an honest email fallback");
    assert.ok(!home.includes('class="contact-form"'), "Never show a non-functional contact form");
  }
  assert.ok(manifest.routes.some(route => route.path === "privacy"), "Privacy notice must be published");
  const privacyPage = await readFile("dist/privacy/index.html", "utf8");
  assert.ok(privacyPage.includes('id="storage"') && privacyPage.includes("portfolio_storage_choices"), "Privacy notice must explain local storage and its minimal choice record");
  const article = await readFile("dist/notes/pedal-response-bench-note/index.html", "utf8");
  const visibleArticle = article.split('<script id="published-content"')[0];
  assert.ok(visibleArticle.replace(/<[^>]+>/g, "").includes("const normalized") && visibleArticle.includes('id="scope"'), "Markdown is pre-rendered, not just a JSON payload");
  const jsonArticle = JSON.parse(await readFile("dist/content/pedal-response-bench-note.json", "utf8"));
  assert.ok(jsonArticle.pt.content.includes("## Escopo") && jsonArticle.es.content.includes("## Alcance"));
  const rss = await readFile("dist/feed.xml", "utf8");
  assert.ok(rss.includes("<rss") && rss.includes("pedal-response-bench-note/"));
  const sitemap = await readFile("dist/sitemap.xml", "utf8");
  assert.ok(sitemap.includes("/lab/") && !sitemap.includes("/admin/"));
  console.log(`Checks passed: pedal math, headings, 3 languages, ${manifest.routes.length} static routes, metadata, RSS and sitemap.`);
} finally { await server.close(); }
