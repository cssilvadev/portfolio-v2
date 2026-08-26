import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Fall back to placeholder values instead of throwing here: this file is
// imported at module load time (before React even mounts), so an uncaught
// throw would blank out the entire page with no on-screen indication of
// what went wrong. Auth-dependent calls will simply fail at runtime instead
// (already handled by try/catch in AuthContext/AuthModal), while the rest of
// the site keeps working.
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Auth and notes " +
      "sync will not work until you add them to a .env file (see .env.example)."
  );
}

export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-anon-key",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

export type SubscriptionTier = "free" | "pro";

export interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  subscription_tier: SubscriptionTier;
  stripe_customer_id?: string | null;
  created_at: string;
}
