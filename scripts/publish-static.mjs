import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { createServer } from "vite";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const server = await createServer({ envDir: false, server: { middlewareMode: true }, appType: "custom" });
const output = path.resolve("dist");
const escape = value => String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
const safeJson = value => JSON.stringify(value).replace(/</g, "\\u003c");
const validSlug = slug => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);

try {
  const [{ projects: fallbackProjects }, { notes: fallbackNotes, loadNoteBySlug }, { buildCmsContent }, { supabase }, { routeMeta, siteUrl }, { default: PublicDocument }] = await Promise.all([
    server.ssrLoadModule("/src/data/projects.ts"), server.ssrLoadModule("/src/data/notes.ts"),
    server.ssrLoadModule("/src/context/ContentContext.tsx"), server.ssrLoadModule("/src/lib/supabase.ts"),
    server.ssrLoadModule("/src/utils/seo.ts"), server.ssrLoadModule("/src/ssr/PublicDocument.tsx"),
  ]);
  let projects = fallbackProjects;
  let notes = fallbackNotes;
  let contentSource = "local fallback";
  // Build uses the same public, published-only query as the browser. Never use
  // service-role credentials or export drafts / profiles / authenticated data.
  if (supabase) {
    try {
      const signal = AbortSignal.timeout(12000);
      const { data: entries, error } = await supabase.from("cms_entries")
        .select("id, kind, slug, date_label, category, cover_image, tags, stack, specs, featured")
        .eq("published", true).order("sort_order", { ascending: true }).order("created_at", { ascending: true }).abortSignal(signal);
      if (error) throw error;
      if (entries?.length) {
        const { data: translations, error: translationError } = await supabase.from("cms_entry_translations")
          .select("entry_id, language, title, excerpt, overview, body").in("entry_id", entries.map(entry => entry.id)).abortSignal(signal);
        if (translationError) throw translationError;
        const mapped = buildCmsContent(entries, translations ?? []);
        if (mapped.projects.length) projects = mapped.projects;
        if (mapped.notes.length) notes = mapped.notes;
        contentSource = "published CMS + editorial notes";
      }
    } catch { console.warn("Public CMS unavailable at build time; exporting the local fallback only."); }
  }
  projects = projects.filter(project => validSlug(project.slug));
  notes = notes.filter(note => validSlug(note.slug));
  const template = await readFile(path.join(output, "index.html"), "utf8");
  const href = route => new URL(route ? `${route.replace(/^\/+|\/+$/g, "")}/` : "", siteUrl).href;
  const manifest = JSON.parse(await readFile(path.join(output, ".vite/manifest.json"), "utf8"));
  const moduleFor = route => route.startsWith("projects/") ? "src/pages/projectPage/ProjectPage.tsx" : route.startsWith("notes/") ? "src/pages/notePage/NotePage.tsx" : ({ projects: "src/pages/projectIndex/ProjectIndex.tsx", notes: "src/pages/notes/NotesIndex.tsx", lab: "src/pages/lab/Lab.tsx", profile: "src/pages/profile/Profile.tsx" })[route] ?? "src/main.tsx";
  const routeStyles = key => {
    const styles = new Set();
    const visited = new Set();
    const collect = entryKey => {
      if (visited.has(entryKey)) return;
      visited.add(entryKey);
      const entry = manifest[entryKey];
      if (!entry) return;
      (entry.css ?? []).forEach(file => styles.add(file));
      (entry.imports ?? []).forEach(collect);
    };
    collect(key);
    return [...styles].filter(file => !template.includes(`/portfolio-v2/${file}`)).map(file => `<link rel="stylesheet" href="/portfolio-v2/${escape(file)}">`).join("");
  };
  const pages = ["", "projects", "notes", "lab", "profile", "admin", ...projects.map(project => `projects/${project.slug}`)].map(route => ({ route }));
  await mkdir(path.join(output, "content"), { recursive: true });
  for (const note of notes) {
    const translations = await Promise.all(["en", "pt", "es"].map(language => loadNoteBySlug(note.slug, language, notes)));
    for (const [index, language] of ["en", "pt", "es"].entries()) note[language] = { ...note[language], content: translations[index]?.content ?? "" };
    note.readingTime = translations[0]?.readingTime ?? note.readingTime;
    await writeFile(path.join(output, "content", `${note.slug}.json`), safeJson(note));
    pages.push({ route: `notes/${note.slug}` });
  }
  for (const page of pages) {
    const meta = routeMeta(`/${page.route}`, "en", projects, notes);
    const setMeta = (html, attribute, key, value) => html.replace(new RegExp(`<meta ${attribute}="${key}" content="[^"]*"\\s*/?>`), `<meta ${attribute}="${key}" content="${escape(value)}" />`);
    let html = template.replace(/<title>.*?<\/title>/s, `<title>${escape(meta.title)}</title>`)
      .replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/s, `<meta name="description" content="${escape(meta.description)}" />`)
      .replace(/<link rel="canonical" href="[^"]*"\s*\/?>/, `<link rel="canonical" href="${escape(meta.canonical)}" />`);
    for (const key of ["title", "description", "image"]) {
      html = setMeta(html, "property", `og:${key}`, meta[key]);
      html = setMeta(html, "name", `twitter:${key}`, meta[key]);
    }
    html = setMeta(html, "property", "og:url", meta.canonical);
    html = setMeta(html, "property", "og:type", meta.type);
    html = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, `<script type="application/ld+json">${safeJson({ "@context": "https://schema.org", "@type": meta.type === "article" ? "Article" : "WebPage", name: meta.title, headline: meta.title, description: meta.description, url: meta.canonical, author: { "@type": "Person", name: "Christian Silva" } })}</script>`);
    html = html.replace("</head>", `<meta name="robots" content="${meta.indexable ? "index,follow" : "noindex,follow"}">${routeStyles(moduleFor(page.route))}<style>[data-prerender] :is(.project-header,.project-hero-frame,.notes-intro){animation:none}</style></head>`);
    const content = { projects, notes: notes.map(note => ({ ...note, ...Object.fromEntries(["en", "pt", "es"].map(language => [language, { ...note[language], content: page.route === `notes/${note.slug}` ? note[language].content : "" }])) })) };
    const markup = page.route === "admin" ? '<main id="main-content"><h1>Content administration</h1><p>JavaScript and authentication are required.</p></main>' : renderToStaticMarkup(React.createElement(PublicDocument, { route: page.route, content }));
    // Render the actual page layout and seed its public data, preventing a
    // different placeholder layout from flashing while the JS is loading.
    html = html.replace('<div id="root"></div>', `<div id="root">${markup}</div><script id="published-content" type="application/json">${safeJson(content)}</script>`);
    if (page.route) html = html.replace(/<link rel="preload"[^>]*robot-transparent\.png[^>]*>/g, "");
    const directory = path.join(output, page.route);
    await mkdir(directory, { recursive: true });
    await writeFile(path.join(directory, "index.html"), html);
  }
  const rss = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>Christian Silva — Notes &amp; Logs</title><link>${siteUrl}</link><description>Engineering articles, build logs and bench notes.</description><language>en</language><atom:link href="${siteUrl}feed.xml" rel="self" type="application/rss+xml"/>${notes.map(note => `<item><title>${escape(note.en.title)}</title><link>${escape(href(`notes/${note.slug}`))}</link><guid isPermaLink="true">${escape(href(`notes/${note.slug}`))}</guid><description>${escape(note.en.excerpt)}</description><category>${escape(note.category)}</category></item>`).join("")}</channel></rss>`;
  await writeFile(path.join(output, "feed.xml"), rss);
  await writeFile(path.join(output, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages.filter(page => page.route !== "admin").map(page => `<url><loc>${escape(href(page.route))}</loc></url>`).join("")}</urlset>`);
  await writeFile(path.join(output, "route-manifest.json"), JSON.stringify({ source: contentSource, routes: pages.map(page => ({ path: page.route, url: href(page.route) })) }, null, 2));
  console.log(`Static publication: ${pages.length} routes, RSS, sitemap (${contentSource}).`);
} finally { await server.close(); }
