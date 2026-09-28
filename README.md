# Christian Silva Portfolio

React 19 + Vite + TypeScript portfolio, deployed under `/portfolio-v2/` on GitHub Pages.

## Local development

```bash
npm install
npm run dev
```

The development-only Note Studio is available at `/studio`. It is excluded from production routing and is loaded through a development-only dynamic import.

## Contact form

Without a configured endpoint, contact explicitly opens the visitor's email app; no non-functional form is shown. To enable Formspree after reviewing privacy/abuse settings, set `VITE_CONTACT_FORM_ENDPOINT` to `https://formspree.io/f/<form-id>`. Only that validated processor is accepted. The browser sends bounded fields using `FormData` with `Accept: application/json`; no secret key is stored in the site.

## Authentication and billing

The project includes a Supabase Auth + Postgres RLS foundation and optional Stripe billing. Passwords are handled by Supabase Auth; the portfolio never receives or stores password hashes. The browser only receives the Supabase publishable/anon key, while Stripe and the Supabase service-role key stay inside Edge Functions.

1. Create or select a Supabase project, copy `.env.example` to `.env`, and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
2. Run [`supabase_schema.sql`](./supabase_schema.sql) in the Supabase SQL editor.
3. In Supabase Auth, enable email/password, configure email confirmation, and add the deployed URL plus its callback URL to the allowed redirect URLs. For this static GitHub Pages build, use `https://cssilvadev.github.io/portfolio-v2/`.
4. Create Stripe Products and Prices. Update `billing_plans.stripe_price_id`, `price_cents`, `currency`, and `active = true` only after checking the values in Stripe.
5. Deploy the functions and set secrets without the `VITE_` prefix:

   ```bash
   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=... STRIPE_SECRET_KEY=... STRIPE_WEBHOOK_SECRET=... RATE_LIMIT_SALT=... APP_ORIGIN=https://cssilvadev.github.io APP_URL=https://cssilvadev.github.io/portfolio-v2
   supabase functions deploy create-checkout-session
   supabase functions deploy stripe-webhook
   ```

6. Add a Stripe webhook for `https://<project-ref>.supabase.co/functions/v1/stripe-webhook` and subscribe to `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `customer.subscription.updated`, and `customer.subscription.deleted`.

Keep `VITE_ENABLE_BILLING=false` and server `BILLING_ENABLED` unset until integration/replay/refund tests are complete. These instructions are preparation, not confirmation of live billing. Match the webhook API version to `2025-08-27.basil`; the webhook gateway must accept Stripe requests without a Supabase JWT, while the function requires the Stripe signature. Never put secrets into the browser or chat.

7. In Supabase Auth, review the production abuse controls before opening registration: set the Auth rate limits, enable CAPTCHA/Turnstile or hCaptcha for sign-up, sign-in, and password reset, require email confirmation, and enable the strongest password policy available for the project. Supabase already rate-limits its Auth endpoints; the custom checkout function additionally limits each authenticated user and best-effort client IP to five attempts per minute. Leaked-password protection is a Supabase Auth setting and may require a paid plan.

### Admin CMS

The production admin area is available at `/admin`. It is not unlocked by a frontend password: create the administrator through the normal Supabase Auth sign-up flow, then promote that account once in the Supabase SQL editor (never from the browser):

```sql
update public.profiles
set role = 'admin'
where email = 'your-email@example.com';
```

After signing in, open `/admin` and use **Importar conteúdo atual** once to migrate the current hard-coded projects/articles into the CMS. From then on, edit articles, projects, translations, metadata, Markdown, publication state and project specifications in the panel. Public pages read published CMS records and retain the local content as a safe fallback if the CMS is empty or unavailable.

The admin permissions are enforced by Postgres RLS, not only by hiding a route in React. The `private.is_admin()` function is used only inside policies, and visitors can read only published content. This follows Supabase's guidance to combine Auth with RLS and to keep security-definer functions isolated and tightly granted ([RLS guidance](https://supabase.com/docs/guides/database/postgres/row-level-security), [database functions](https://supabase.com/docs/guides/database/functions)).

The client cannot grant itself a plan: plan visibility is controlled by RLS, checkout prices are read server-side, and entitlements are written only by the signed webhook using idempotency records. Until the plan rows, secrets, functions, and webhook are configured, checkout intentionally fails closed.

For maximum session isolation, the next deployment evolution would be an SSR/BFF layer with HttpOnly cookies. GitHub Pages itself is a static host, so this version uses Supabase's browser session flow and keeps all privileged operations server-side.

## GitHub Pages deep links

The build pre-renders known public routes, exports article content, RSS and sitemap. Published deep routes receive real HTML on Pages; `public/404.html` is only the SPA fallback for unknown/new routes. After adding/unpublishing CMS slugs, redeploy to regenerate the static documents.

## Security and privacy operations

See [SECURITY.md](./SECURITY.md) for implemented defenses, MFA migration order, server-side Auth/CAPTCHA settings, host limitations and billing gates. See [PRIVACY_OPERATIONS.md](./PRIVACY_OPERATIONS.md) for retention/provider/rights decisions still required. Public registration is preserved. `/privacy/` explains the current implementation in English, Portuguese and Spanish; it does not certify LGPD compliance.

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
