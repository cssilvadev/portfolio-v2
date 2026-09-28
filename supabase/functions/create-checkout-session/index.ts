import Stripe from "npm:stripe@18.5.0";
import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2.116.0";
import { billingUrls, readLimitedBody } from "../_shared/security.ts";

const urls = billingUrls(Deno.env.get("APP_ORIGIN") ?? "", Deno.env.get("APP_URL") ?? "");

const corsHeaders = {
  ...(urls ? { "Access-Control-Allow-Origin": urls.origin } : {}),
  "Vary": "Origin",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("cf-connecting-ip")?.trim() || "unknown";
}

async function consumeLimit(admin: SupabaseClient, rawKey: string, salt: string) {
  const keyHash = await sha256(`${salt}:${rawKey}`);
  const { data, error } = await admin.rpc("consume_rate_limit", {
    p_key_hash: keyHash,
    p_window_seconds: 60,
    p_max_requests: 5,
  });
  if (error) throw error;
  if (!Array.isArray(data) || data.length !== 1) throw new Error("Invalid rate limit decision");
  const result = data[0];
  return {
    allowed: result?.allowed === true,
    retryAfterSeconds: Number(result?.retry_after_seconds ?? 60),
  };
}

async function handleRequest(request: Request) {
  if (Deno.env.get("BILLING_ENABLED") !== "true" || !urls) return json({ error: "Billing is not enabled" }, 503);
  if (request.headers.get("origin") && request.headers.get("origin") !== urls.origin) return json({ error: "Origin not allowed" }, 403);
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const authorization = request.headers.get("Authorization");
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const publishableKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY") ?? "";
  const rateLimitSalt = Deno.env.get("RATE_LIMIT_SALT") ?? "";

  if (!supabaseUrl || !publishableKey || !serviceRoleKey || !stripeSecretKey || rateLimitSalt.length < 32) {
    return json({ error: "Billing is not configured" }, 503);
  }
  if (!authorization) return json({ error: "Authentication required" }, 401);

  const userClient = createClient(supabaseUrl, publishableKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: { user }, error: userError } = await userClient.auth.getUser();
  if (userError || !user || !user.email) return json({ error: "Authentication required" }, 401);

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  let userLimit: Awaited<ReturnType<typeof consumeLimit>>;
  let ipLimit: Awaited<ReturnType<typeof consumeLimit>>;
  try {
    userLimit = await consumeLimit(admin, `checkout:user:${user.id}`, rateLimitSalt);
    ipLimit = await consumeLimit(admin, `checkout:ip:${getClientIp(request)}`, rateLimitSalt);
  } catch {
    return json({ error: "Rate limiting is unavailable" }, 503);
  }
  if (!userLimit.allowed || !ipLimit.allowed) {
    const retryAfter = Math.max(userLimit.retryAfterSeconds, ipLimit.retryAfterSeconds);
    return new Response(JSON.stringify({ error: "Too many requests" }), {
      status: 429,
      headers: { ...corsHeaders, "Content-Type": "application/json", "Retry-After": String(retryAfter) },
    });
  }

  let payload: { planSlug?: unknown };
  try {
    if (!(request.headers.get("content-type") ?? "").toLowerCase().includes("application/json")) {
      return json({ error: "JSON required" }, 415);
    }
    const body = await readLimitedBody(request, 2048);
    payload = JSON.parse(body) as { planSlug?: unknown };
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) return json({ error: "Invalid JSON" }, 400);
  } catch (error) {
    if (error instanceof RangeError) return json({ error: "Payload too large" }, 413);
    return json({ error: "Invalid JSON" }, 400);
  }

  const planSlug = typeof payload.planSlug === "string" ? payload.planSlug : "";
  if (!/^[a-z0-9-]{3,64}$/.test(planSlug)) return json({ error: "Invalid plan" }, 400);

  const { data: plan, error: planError } = await userClient
    .from("billing_plans")
    .select("id, slug, name, kind, interval, stripe_price_id")
    .eq("slug", planSlug)
    .eq("active", true)
    .maybeSingle();
  if (planError || !plan?.stripe_price_id) return json({ error: "Plan is unavailable" }, 409);

  const { data: existingEntitlement, error: entitlementError } = await admin
    .from("entitlements")
    .select("ends_at")
    .eq("user_id", user.id)
    .eq("plan_id", plan.id)
    .eq("status", "active")
    .maybeSingle();
  if (entitlementError) return json({ error: "Entitlement check unavailable" }, 503);
  if (existingEntitlement && (!existingEntitlement.ends_at || new Date(existingEntitlement.ends_at).getTime() > Date.now())) {
    return json({ error: "Plan already active" }, 409);
  }
  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .maybeSingle();
  if (profileError || !profile) return json({ error: "Profile unavailable" }, 503);

  const stripe = new Stripe(stripeSecretKey, { apiVersion: "2025-08-27.basil" });
  const mode = plan.kind === "recurring" ? "subscription" : "payment";
  const session = await stripe.checkout.sessions.create({
    mode,
    line_items: [{ price: plan.stripe_price_id, quantity: 1 }],
    ...(profile?.stripe_customer_id
      ? { customer: profile.stripe_customer_id }
      : { customer_email: user.email }),
    client_reference_id: user.id,
    metadata: { user_id: user.id, plan_slug: plan.slug },
    success_url: `${urls.app}/?checkout=success`,
    cancel_url: `${urls.app}/?checkout=cancelled`,
  });

  return json({ url: session.url });
}

Deno.serve(async request => {
  try { return await handleRequest(request); }
  catch { return json({ error: "Checkout unavailable" }, 503); }
});
