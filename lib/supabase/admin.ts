import { createClient } from "@supabase/supabase-js";

/**
 * Supabase Admin client (service role).
 * ⚠️  NEVER expose this to the browser.
 * Use ONLY in API routes or Server Actions that require
 * admin-level database access (bypasses RLS).
 */
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
