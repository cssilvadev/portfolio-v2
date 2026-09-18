import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabase = supabaseUrl &&
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
