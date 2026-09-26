const PROTECTED_PATHS = [
  "/dashboard",
  "/onboarding",
  "/profile",
  "/cv",
  "/universities",
  "/favorites",
  "/compare",
  "/opportunities",
  "/exams",
  "/roadmap",
  "/tasks",
  "/assistant",
  "/mentors",
  "/impact",
];

const AUTH_PATHS = ["/login", "/signup"];

function matches(pathname: string, paths: readonly string[]): boolean {
  return paths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

export function decideProxyRedirect(
  pathname: string,
  session: { claimsAuthenticated: boolean; serverUser: boolean | null },
): "/dashboard" | "/login" | null {
  if (matches(pathname, AUTH_PATHS)) {
    return session.serverUser === true ? "/dashboard" : null;
  }
  if (matches(pathname, PROTECTED_PATHS) && !session.claimsAuthenticated) {
    return "/login";
  }
  return null;
}
