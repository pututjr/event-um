import { createClient } from "@supabase/supabase-js";

/**
 * Service-role client for privileged operations (creating/deleting peserta
 * accounts, resetting passwords). Server-only - never import this from a
 * Client Component, and never expose SUPABASE_SERVICE_ROLE_KEY to the browser.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
