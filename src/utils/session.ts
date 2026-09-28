import type { SupabaseClient } from "@supabase/supabase-js";

/** Revoke this session's refresh token and remove it locally, not other devices. */
export async function endLocalSession(client: Pick<SupabaseClient, "auth">) {
  const { error } = await client.auth.signOut({ scope: "local" });
  if (error) throw error;
}
