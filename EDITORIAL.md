# Public engineering lab

## What's live

- `/projects`: scalable catalog with search and explicit documentation status.
- `/projects/jarvis`: case study with problem, architecture, decisions, actual screenshots, limitations and related writing.
- Other known projects share the problem / architecture / validation / related-reading structure. A technical overview is not a claim of a completed, benchmarked robot.
- `/lab`: accessible pedal calibration **simulation**, using an SVG chart and range controls. No hardware permissions, camera, microphone, WebGL loop or sensor polling.
- `/notes`: topic filter, search and editorial formats (article / build log / bench note).
- `/profile`: factual profile based on existing site content, with a print stylesheet. Use the browser's **Save as PDF** option; this is not an automatically downloaded or independently verified CV.
- `/feed.xml`: RSS, regenerated with the public content snapshot on each build.

The approved liquid-glass navbar and robot assembly mechanics are preserved.

## Content ownership and honesty

`src/data/editorial.ts` defines story chapters and default relationships for existing projects. Real Jarvis screenshots already in `public/projects` are used as evidence. No new hardware photos, videos, hardware measurements or employment claims are fabricated. Add those when they exist, then update the corresponding story and status.

`src/data/labNotes.ts` contains the portfolio implementation log and a reproducible mathematical pedal note, in EN/PT/ES. The latter explicitly excludes electrical noise, ADC quantization, USB timing and game-side filtering.

The CMS remains authoritative for its published entries. Supplemental local notes are merged by slug, so a CMS version of either supplemental note overrides the local one. Legacy zero-latency wording is corrected **for display only**; the database is not changed. Existing original article bodies are not overwritten.

## CMS editing

The admin article editor includes **Formato editorial** and **Projetos relacionados**. These use reserved tags `format:article`, `format:build-log`, `format:bench-note`, and `project:<slug>` in the existing tags column. Reserved tags are hidden from readers. No schema migration is needed. New related projects must already be published to appear as links.

Publishing in the CMS updates the running app, but **new slugs need a new Pages build** to get static HTML and be added to RSS and sitemap. Run the existing GitHub Actions “Deploy to GitHub Pages” workflow after content changes. No GitHub token is stored in the browser or CMS.

## Static publication

`npm run build` creates the Vite app and then runs `scripts/publish-static.mjs`.

The generator queries only `published = true` CMS entries and translations for those entry IDs, using the same publishable client as the browser. If the CMS is unavailable, it warns and exports the existing local fallback. It never exports drafts, accounts or profiles. The manifest records which source was used.

Each known project/article route gets a real `index.html`: the actual public React page layout, unique metadata, canonical URL, Open Graph and JSON-LD. Route-specific styles are included from Vite's manifest. The initial lazy page resolves before React replaces the visible document, using the same public content snapshot; there is no hidden crawler-only duplicate or unrelated placeholder layout. Static article bodies use the same Markdown renderer as the interactive app. Deep pages don't preload the home robot.

Only article metadata and the current article body are embedded into each route. Separate public `/content/<slug>.json` snapshots retain published article navigation if the CMS is temporarily unavailable. These snapshots contain public translations, never authenticated data. Remove or unpublish content with a new build to remove its static artifacts as well.

The generated content defaults to English. The existing EN/PT/ES selector continues to work in the interactive app. Locale-specific static URLs and `hreflang` are deliberately not claimed. Unknown URLs still use the existing 404 fallback, and admin is `noindex` and excluded from the sitemap. Search engine indexing and share-card caching are not guaranteed by a successful build.

## Checks and performance

Run `npm run lint`, `npx tsc -b --noEmit`, `npm run build`, and `npm run check:publication`.

Publication checks cover normalized pedal endpoints and monotonic response, accented and duplicate headings, three languages, unique route titles, canonical URLs, pre-rendered article code, valid JSON-LD, bundled asset existence, secret-key markers, RSS and sitemap. CI runs these checks before deploying.

For diagnostics open a page with `?performance=1`. A lazily loaded `web-vitals` panel shows LCP, INP and CLS for that full document-load session. Interact before expecting INP. Unsupported or not-yet-finalized metrics remain pending. Soft SPA navigations are not reported as independent page loads. Values stay on the device: no persistence, telemetry endpoint or analytics account. A session measurement is not a field percentile or a claim of a passing Lighthouse score.

Before calling the portfolio finished, add real bench photos/videos, verify current education/CV facts, publish representative test procedures and measurements, and run more physical-device checks (including Samsung Browser with “Dark site” disabled when assessing the site's light palette).
