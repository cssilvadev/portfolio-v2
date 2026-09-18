import { createClient } from "@supabase/supabase-js";

// These values are intentionally public. Supabase publishable keys identify the
// project in browser apps; authorization remains enforced by Auth and RLS.
const defaultSupabaseUrl = "https://wigksclnaybjqmoktsje.supabase.co";
const defaultSupabasePublishableKey = "sb_publishable_9sR0LIG7AWja9REynvnPBw_VDJUX-Jc";

const readEnvValue = (rawValue: string | undefined, acceptedNames: string[]) => {
  if (!rawValue) return undefined;

  const lines = rawValue.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const namedLine = lines.find((line) =>
    acceptedNames.some((name) => line.startsWith(`${name}=`)),
  );
  const candidate = namedLine ?? lines[0];
  const assignment = candidate.match(/^[A-Z][A-Z0-9_]*\s*=\s*(.+)$/);

  return (assignment?.[1] ?? candidate).trim().replace(/^['"]|['"]$/g, "");
};

const configuredSupabaseUrl = readEnvValue(
  import.meta.env.VITE_SUPABASE_URL as string | undefined,
  ["VITE_SUPABASE_URL", "SUPABASE_URL"],
);
const configuredSupabaseAnonKey = readEnvValue(
  import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined,
  ["VITE_SUPABASE_ANON_KEY", "SUPABASE_PUBLISHABLE_KEY"],
);

const isValidSupabaseUrl = (value: string | undefined) => {
  if (!value) return false;

  try {
    const url = new URL(value);
    return url.protocol === "https:" ||
      (url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname));
  } catch {
    return false;
  }
};

const isValidPublishableKey = (value: string | undefined) => Boolean(
  value &&
  !value.startsWith("your_") &&
  !value.includes("placeholder") &&
  !value.startsWith("sb_secret_"),
);

const supabaseUrl = isValidSupabaseUrl(configuredSupabaseUrl)
  ? configuredSupabaseUrl
  : defaultSupabaseUrl;
const supabaseAnonKey = isValidPublishableKey(configuredSupabaseAnonKey)
  ? configuredSupabaseAnonKey
  : defaultSupabasePublishableKey;

export const supabase = isValidSupabaseUrl(supabaseUrl) &&
  supabaseUrl &&
  supabaseAnonKey &&
  isValidPublishableKey(supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        flowType: "pkce",
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export type SubscriptionTier = "free" | "pro" | "lifetime";

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: "user" | "admin";
  subscription_tier: SubscriptionTier;
};

export type BillingPlan = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  kind: "recurring" | "lifetime";
  interval: "month" | "year" | "once";
  currency: string;
  price_cents: number;
};
