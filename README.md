# Christian Silva Portfolio

React 19 + Vite + TypeScript portfolio, deployed under `/portfolio-v2/` on GitHub Pages.

**Permanent cost policy:** keep this portfolio free for its owner and visitors. Do not activate Stripe, paid plans, metered billing, add-ons, credit-card trials, or any other paid feature. See [AGENTS.md](./AGENTS.md). Existing billing code is dormant legacy preparation, not a launch plan.

## Local development

```bash
npm install
npm run dev
```

The development-only Note Studio is available at `/studio`. It is excluded from production routing and is loaded through a development-only dynamic import.

## Contact form

The contact form uses a Supabase Edge Function, Cloudflare Turnstile, a server-side hashed-IP rate limit and Brevo's transactional email API. Message bodies are delivered by email and are not written to the portfolio database. Until the backend is deployed and configured, keep `VITE_CONTACT_FORM_ENABLED=false`; the site then offers a direct email link and copy-email fallback.

To activate it, create a Turnstile widget for `cssilvadev.github.io`, verify a sender in Brevo, and set these Supabase Edge Function secrets in the Supabase dashboard (never in Git or chat): `BREVO_API_KEY`, `CONTACT_FROM_EMAIL`, `CONTACT_TO_EMAIL`, `CONTACT_TURNSTILE_SECRET_KEY`, and a new random `CONTACT_RATE_LIMIT_SALT` with at least 32 characters. Supabase provides `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to functions. Deploy `send-contact-message`, then set GitHub repository variable `VITE_TURNSTILE_SITE_KEY` to the widget's public site key and `VITE_CONTACT_FORM_ENABLED` to `true`. Only enable the public form after a real end-to-end delivery test. Keep all services on their free plans; Brevo's Free plan currently includes 300 email sends/day and Supabase Free includes 500,000 Edge Function invocations/month. Quotas can change; never enable paid overages.

## Authentication

The project includes a Supabase Auth + Postgres RLS foundation. Passwords are handled by Supabase Auth; the portfolio never receives or stores password hashes. The browser only receives the Supabase publishable/anon key. Existing Stripe code and Edge Functions are not enabled under the free-only policy.

1. Create or select a Supabase project, copy `.env.example` to `.env`, and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
2. Run [`supabase_schema.sql`](./supabase_schema.sql) in the Supabase SQL editor.
3. In Supabase Auth, enable email/password, configure email confirmation, and add the deployed URL plus its callback URL to the allowed redirect URLs. For this static GitHub Pages build, use `https://cssilvadev.github.io/portfolio-v2/`.
4. Review the production abuse controls: Auth rate limits, CAPTCHA for sign-up/sign-in/password reset, email confirmation and the server-side password policy. Public signup still needs working SMTP for visitors; the default Supabase sender does not deliver to arbitrary addresses. Choose only a provider whose free tier and account requirements fit the cost rule. Leaked-password protection is a paid Supabase setting and must remain disabled.

Never put secrets into the browser bundle, repository, or chat. Keep `VITE_ENABLE_BILLING=false` and server `BILLING_ENABLED` unset under the permanent free-only policy.

### Admin CMS

The production admin area is available at `/admin`. It is not unlocked by a frontend password: create the administrator through the normal Supabase Auth sign-up flow, then promote that account once in the Supabase SQL editor (never from the browser):

```sql
update public.profiles
set role = 'admin'
where email = 'your-email@example.com';
```

After signing in, open `/admin` and use **Importar conteúdo atual** once to migrate the current hard-coded projects/articles into the CMS. From then on, edit articles, projects, translations, metadata, Markdown, publication state and project specifications in the panel. Public pages read published CMS records and retain the local content as a safe fallback if the CMS is empty or unavailable.

The admin permissions are enforced by Postgres RLS, not only by hiding a route in React. The `private.is_admin()` function is used only inside policies, and visitors can read only published content. This follows Supabase's guidance to combine Auth with RLS and to keep security-definer functions isolated and tightly granted ([RLS guidance](https://supabase.com/docs/guides/database/postgres/row-level-security), [database functions](https://supabase.com/docs/guides/database/functions)).

The client cannot grant itself a plan: plan visibility is controlled by RLS. The dormant checkout implementation fails closed and must not be activated for this free-only portfolio.

For maximum session isolation, the next deployment evolution would be an SSR/BFF layer with HttpOnly cookies. GitHub Pages itself is a static host, so this version uses Supabase's browser session flow and keeps all privileged operations server-side.

## GitHub Pages deep links

The build pre-renders known public routes, exports article content, RSS and sitemap. Published deep routes receive real HTML on Pages; `public/404.html` is only the SPA fallback for unknown/new routes. After adding/unpublishing CMS slugs, redeploy to regenerate the static documents.

## Security and privacy operations

See [SECURITY.md](./SECURITY.md) for implemented defenses, MFA migration order, server-side Auth/CAPTCHA settings, host limitations and billing gates. See [PRIVACY_OPERATIONS.md](./PRIVACY_OPERATIONS.md) for retention/provider/rights decisions still required. Public registration is preserved. `/privacy/` explains the current implementation in English, Portuguese and Spanish; it does not certify LGPD compliance.

Run `npm run check:live-security` for a read-only check of anonymous access on the published Supabase API. It does not create users, modify content or inspect account records; authenticated-user and MFA checks remain separate.

Apply `supabase/migrations/202609280001_security_hardening.sql` to an existing project **after** publishing and enrolling the administrator's authenticator. This repository change does not apply migrations or provider settings remotely. GitHub Pages gets CSP via HTML meta, not unsupported custom response headers.

The footer and privacy notice expose local storage settings: remember theme/language independently, remove the saved values, and sign out of this browser separately. New visitors do not automatically persist appearance preferences; valid legacy values are preserved. Turning remembering off leaves the current display unchanged and retains only a minimal choices record. Cleanup never calls `localStorage.clear()` or deletes account data. No analytics/cookie-consent tracker is introduced. Tests cover blocked storage, exact-key cleanup, legacy/disabled bootstrap and local logout using fixtures.

## Scroll-driven landing page

The landing page is organized as full-viewport chapters: the robot assembly, three featured project showcases, an editorial notes section, about, and contact. The hero uses `public/images/robot-transparent.png`, a transparent cutout based on `robot-original.png` from the original Spline robot. Scroll progress assembles its head, torso, arms, pelvis and legs as independent clipped layers; no character is visible at the top. There is no black media panel or activation reticle, so the robot sits directly on the current light or dark theme. No WebGL scene or continuous animation loop runs on the landing page. Reduced-motion visitors see the complete robot and regular-flow text. The previous Spline component remains in the repository for reference but is no longer imported by the landing page. The `/projects` route holds the complete, searchable project collection; the Home only features the three most recent by year.

## Verification

```bash
npx tsc -b --noEmit
npm run lint
npm run check:security
npm audit --audit-level=high
npm run build
npm run check:publication
```
