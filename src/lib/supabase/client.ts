import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "@/lib/database.types";

/**
 * Supabase client for use in Client Components. Safe to call anywhere on
 * the browser — `createBrowserClient` uses a singleton internally.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
