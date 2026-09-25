import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import type { Database } from "@/lib/database.types";

/**
 * Supabase client for use in Server Components, Server Actions and Route
 * Handlers. Must be created fresh per request because it reads the request
 * cookies. Writing cookies from a Server Component is a no-op (ignored) —
 * `src/proxy.ts` is responsible for persisting refreshed session cookies.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Called from a Server Component — the proxy refreshes and
            // persists the session cookie on the next request instead.
          }
        },
      },
    },
  );
}
