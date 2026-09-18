import { createClient } from "@supabase/supabase-js";

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim();

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

export const supabase = isValidSupabaseUrl(supabaseUrl) &&
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseAnonKey.startsWith("your_") &&
  !supabaseAnonKey.includes("placeholder")
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
