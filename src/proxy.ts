import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const PROTECTED_PATHS = [
  "/dashboard",
  "/onboarding",
  "/profile",
  "/universities",
  "/roadmap",
  "/tasks",
];

const AUTH_PATHS = ["/login", "/signup"];

/**
 * Runs on every request (see `config.matcher` below). Refreshes the Supabase
 * session cookie so Server Components always see an up-to-date session, and
 * performs a first line of route-protection redirects. This is defense in
 * depth only — every protected page must still verify the user server-side
 * with `supabase.auth.getUser()`.
 */
export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          supabaseResponse = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            supabaseResponse.cookies.set(name, value, options);
          }
          for (const [key, headerValue] of Object.entries(headers)) {
            supabaseResponse.headers.set(key, headerValue);
          }
        },
      },
    },
  );

  // Do not run code between `createServerClient` and `getClaims()`. A
  // mistake here can make it very hard to debug users being randomly
  // signed out.
  const { data } = await supabase.auth.getClaims();
  const isAuthenticated = data !== null;

  const { pathname } = request.nextUrl;
  const isProtectedPath = PROTECTED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
  const isAuthPath = AUTH_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  if (isProtectedPath && !isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (isAuthPath && isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // IMPORTANT: return the `supabaseResponse` object built above. Returning a
  // new response here would drop the refreshed cookies and sign users out.
  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
