import { contactEmailText, parseContactPayload } from "../_shared/contact.ts";
import { readLimitedBody } from "../_shared/security.ts";

const allowedOrigins = new Set([
  "https://cssilvadev.github.io",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
]);
const maxBodyBytes = 8192;

function json(body: unknown, status: number, origin: string) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Headers": "authorization, apikey, x-client-info, content-type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Cache-Control": "no-store",
      "Content-Type": "application/json; charset=utf-8",
      "Vary": "Origin",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return request.headers.get("cf-connecting-ip")?.trim() || forwarded || "";
}

async function sha256(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function pruneRateLimitHashes(supabaseUrl: string, serviceRoleKey: string) {
  const url = new URL("/rest/v1/rate_limit_buckets", supabaseUrl);
  url.searchParams.set("updated_at", `lt.${new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()}`);
  const response = await fetch(url, {
    method: "DELETE",
    headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}`, Prefer: "return=minimal" },
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error("Rate-limit retention cleanup failed");
}

async function consumeRateLimit(supabaseUrl: string, serviceRoleKey: string, salt: string, ip: string) {
  const keyHash = await sha256(`${salt}:contact:${ip}`);
  const response = await fetch(new URL("/rest/v1/rpc/consume_rate_limit", supabaseUrl), {
    method: "POST",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ p_key_hash: keyHash, p_window_seconds: 600, p_max_requests: 3 }),
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error("Rate limiting unavailable");
  const result = await response.json();
  if (!Array.isArray(result) || result.length !== 1) throw new Error("Invalid rate-limit response");
  return { allowed: result[0]?.allowed === true, retryAfter: Number(result[0]?.retry_after_seconds ?? 600) };
}

async function verifyTurnstile(token: string, secret: string, hostname: string) {
  const body = new URLSearchParams({ secret, response: token });
  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    signal: AbortSignal.timeout(10000),
  });
  let result: Record<string, unknown>;
  try {
    result = await response.json();
  } catch {
    return { ok: false, reason: "siteverify-http", status: response.status, errorCodes: [] };
  }
  if (!response.ok) return {
    ok: false,
    reason: "siteverify-http",
    status: response.status,
    errorCodes: Array.isArray(result?.["error-codes"]) ? result["error-codes"].filter((code: unknown) => typeof code === "string").slice(0, 5) : [],
  };
  if (result?.success !== true) return {
    ok: false,
    reason: "token-rejected",
    errorCodes: Array.isArray(result?.["error-codes"]) ? result["error-codes"].filter((code: unknown) => typeof code === "string").slice(0, 5) : [],
  };
  if (result?.action !== "contact") return { ok: false, reason: "action-mismatch", action: result?.action ?? null };
  if (result?.hostname !== hostname) return { ok: false, reason: "hostname-mismatch", hostname: result?.hostname ?? null };
  return { ok: true as const };
}

async function sendWithBrevo(input: ReturnType<typeof parseContactPayload> & { kind: "message" }, apiKey: string, sender: string, recipient: string) {
  const { value } = input;
  const subjectName = `${value.firstName} ${value.lastName}`
    .split("").map((character) => character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127 ? " " : character)
    .join("").replace(/\s+/g, " ").slice(0, 205);
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": apiKey, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      sender: { email: sender, name: "Christian Silva · Portfolio" },
      to: [{ email: recipient, name: "Christian Silva" }],
      replyTo: { email: value.email, name: `${value.firstName} ${value.lastName}` },
      subject: `Portfolio contact — ${subjectName}`,
      textContent: contactEmailText(value),
    }),
    signal: AbortSignal.timeout(15000),
  });
  return response.ok;
}

Deno.serve(async (request) => {
  const origin = request.headers.get("origin") ?? "";
  if (!allowedOrigins.has(origin)) return new Response(null, { status: 403, headers: { "Cache-Control": "no-store" } });
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers": "authorization, apikey, x-client-info, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Max-Age": "600",
    "Vary": "Origin",
  } });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405, origin);
  if (!(request.headers.get("content-type") ?? "").toLowerCase().includes("application/json")) return json({ error: "JSON required" }, 415, origin);

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const rateLimitSalt = Deno.env.get("CONTACT_RATE_LIMIT_SALT") ?? "";
  const turnstileSecret = (Deno.env.get("CONTACT_TURNSTILE_SECRET_KEY") ?? "").trim();
  const brevoApiKey = Deno.env.get("BREVO_API_KEY") ?? "";
  const sender = Deno.env.get("CONTACT_FROM_EMAIL") ?? "";
  const recipient = Deno.env.get("CONTACT_TO_EMAIL") ?? "";
  if (!supabaseUrl || !serviceRoleKey || rateLimitSalt.length < 32 || !turnstileSecret || !brevoApiKey ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sender) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)) {
    return json({ error: "Contact service unavailable" }, 503, origin);
  }

  let payload: unknown;
  try {
    const rawBody = await readLimitedBody(request, maxBodyBytes);
    payload = JSON.parse(rawBody);
  } catch (error) {
    return json({ error: error instanceof RangeError ? "Payload too large" : "Invalid request" }, error instanceof RangeError ? 413 : 400, origin);
  }
  const parsed = parseContactPayload(payload);
  if (parsed.kind === "honeypot") return json({ sent: true }, 200, origin);
  if (parsed.kind !== "message") return json({ error: "Invalid message fields" }, 400, origin);

  const ip = clientIp(request);
  if (!ip || ip.length > 128) return json({ error: "Contact service unavailable" }, 503, origin);
  try {
    await pruneRateLimitHashes(supabaseUrl, serviceRoleKey);
    const limit = await consumeRateLimit(supabaseUrl, serviceRoleKey, rateLimitSalt, ip);
    if (!limit.allowed) return new Response(JSON.stringify({ error: "Too many requests" }), {
      status: 429,
      headers: { ...json({}, 200, origin).headers, "Retry-After": String(Math.max(1, limit.retryAfter)) },
    });
  } catch {
    return json({ error: "Contact service unavailable" }, 503, origin);
  }

  const hostname = new URL(origin).hostname;
  try {
    const verification = await verifyTurnstile(parsed.value.turnstileToken, turnstileSecret, hostname);
    if (!verification.ok) {
      console.warn("Turnstile rejected contact request", verification);
      return json({ error: "Security check failed" }, 400, origin);
    }
    const sent = await sendWithBrevo(parsed, brevoApiKey, sender, recipient);
    if (!sent) return json({ error: "Message delivery failed" }, 502, origin);
    return json({ sent: true }, 200, origin);
  } catch {
    return json({ error: "Message delivery unavailable" }, 502, origin);
  }
});
