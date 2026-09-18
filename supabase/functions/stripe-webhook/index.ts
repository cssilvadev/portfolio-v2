import Stripe from "npm:stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  apiVersion: "2025-06-30.basil",
});
const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") ?? "";
const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const headers = { "Content-Type": "application/json" };
const response = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers });
const MAX_WEBHOOK_BYTES = 1024 * 1024;

async function refreshTier(userId: string) {
  const { data: entitlements } = await admin
    .from("entitlements")
    .select("status, ends_at, plan:billing_plans(kind)")
    .eq("user_id", userId)
    .eq("status", "active");

  const valid = (entitlements ?? []).filter((item) => !item.ends_at || new Date(item.ends_at).getTime() > Date.now());
  const hasLifetime = valid.some((item) => (item.plan as { kind?: string } | null)?.kind === "lifetime");
  const tier = hasLifetime ? "lifetime" : valid.length > 0 ? "pro" : "free";
  const { error } = await admin.from("profiles").update({ subscription_tier: tier }).eq("id", userId);
  if (error) throw error;
}

async function upsertEntitlement(
  userId: string,
  planSlug: string,
  source: "stripe_subscription" | "stripe_payment",
  referenceId: string,
  endsAt: string | null,
  status: "active" | "revoked" | "expired" = "active",
) {
  const { data: plan, error: planError } = await admin.from("billing_plans").select("id").eq("slug", planSlug).maybeSingle();
  if (planError || !plan) throw planError ?? new Error("Plan not found");
  const { error: entitlementError } = await admin.from("entitlements").upsert({
    user_id: userId,
    plan_id: plan.id,
    source,
    status,
    starts_at: new Date().toISOString(),
    ends_at: endsAt,
    stripe_reference_id: referenceId,
  }, { onConflict: "user_id,plan_id" });
  if (entitlementError) throw entitlementError;
  await refreshTier(userId);
}

Deno.serve(async (request) => {
  if (request.method !== "POST" || !webhookSecret || !serviceRoleKey) return response({ error: "Not found" }, 404);
  const signature = request.headers.get("stripe-signature");
  if (!signature) return response({ error: "Missing signature" }, 400);

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(contentLength) && contentLength > MAX_WEBHOOK_BYTES) return response({ error: "Payload too large" }, 413);
  const rawBody = await request.text();
  if (rawBody.length > MAX_WEBHOOK_BYTES) return response({ error: "Payload too large" }, 413);
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(rawBody, signature, webhookSecret);
  } catch {
    return response({ error: "Invalid signature" }, 400);
  }

  const { data: prior, error: priorError } = await admin.from("billing_events").select("processed_at").eq("stripe_event_id", event.id).maybeSingle();
  if (priorError) return response({ error: "Event store unavailable" }, 503);
  if (prior?.processed_at) return response({ received: true });
  const { error: eventInsertError } = await admin.from("billing_events").upsert({ stripe_event_id: event.id, event_type: event.type }, { onConflict: "stripe_event_id" });
  if (eventInsertError) return response({ error: "Event store unavailable" }, 503);

  try {
    if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.user_id ?? session.client_reference_id;
      const planSlug = session.metadata?.plan_slug;
      if (userId && planSlug) {
        if (session.mode === "subscription" && !session.subscription) throw new Error("Subscription reference missing");
        const reference = session.subscription?.toString() ?? session.payment_intent?.toString();
        if (reference) {
          let endsAt: string | null = null;
          if (session.mode === "subscription" && session.subscription) {
            const subscription = await stripe.subscriptions.retrieve(session.subscription.toString());
            const { data: plan } = await admin.from("billing_plans").select("id").eq("slug", planSlug).maybeSingle();
            if (!plan) throw new Error("Plan not found");
            endsAt = new Date(subscription.current_period_end * 1000).toISOString();
            const { error: subscriptionError } = await admin.from("subscriptions").upsert({
              user_id: userId,
              plan_id: plan.id,
              stripe_subscription_id: subscription.id,
              stripe_customer_id: session.customer?.toString() ?? null,
              status: subscription.status,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: endsAt,
              cancel_at_period_end: subscription.cancel_at_period_end,
            }, { onConflict: "stripe_subscription_id" });
            if (subscriptionError) throw subscriptionError;
            const subscriptionStatus = ["active", "trialing"].includes(subscription.status) ? "active" : "revoked";
            await upsertEntitlement(
              userId,
              planSlug,
              "stripe_subscription",
              reference,
              endsAt,
              subscriptionStatus,
            );
          } else {
            await upsertEntitlement(userId, planSlug, "stripe_payment", reference, endsAt);
          }
          if (session.customer) {
            const { error: profileError } = await admin.from("profiles").update({ stripe_customer_id: session.customer.toString() }).eq("id", userId);
            if (profileError) throw profileError;
          }
        }
      }
    }

    if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;
      const { data: row } = await admin.from("subscriptions").select("user_id").eq("stripe_subscription_id", subscription.id).maybeSingle();
      if (row) {
        const { error: subscriptionUpdateError } = await admin.from("subscriptions").update({
          status: event.type === "customer.subscription.deleted" ? "canceled" : subscription.status,
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
        }).eq("stripe_subscription_id", subscription.id);
        if (subscriptionUpdateError) throw subscriptionUpdateError;
        const entitlementStatus = event.type === "customer.subscription.deleted"
          ? "expired"
          : (["active", "trialing"].includes(subscription.status) ? "active" : "revoked");
        const { error: entitlementUpdateError } = await admin.from("entitlements").update({
          status: entitlementStatus,
          ends_at: new Date(subscription.current_period_end * 1000).toISOString(),
        }).eq("stripe_reference_id", subscription.id);
        if (entitlementUpdateError) throw entitlementUpdateError;
        await refreshTier(row.user_id);
      }
    }

    const { error: processedError } = await admin.from("billing_events").update({ processed_at: new Date().toISOString() }).eq("stripe_event_id", event.id);
    if (processedError) throw processedError;
    return response({ received: true });
  } catch {
    return response({ error: "Webhook processing failed" }, 500);
  }
});
