const DEFAULT_REDIRECT_PATH = "/dashboard";

// Matches ASCII control characters (0x00–0x1F, 0x7F) that have no business
// appearing in a path and are sometimes used to smuggle CRLF/other tricks.
const CONTROL_CHAR_PATTERN = /[\x00-\x1f\x7f]/;

/**
 * Validates a user-supplied `next` redirect target and returns a safe,
 * same-origin, relative path to redirect to after login. Rejects anything
 * that could be used for an open redirect:
 * - empty / missing values
 * - absolute URLs (`https://evil.com`, `mailto:...`, etc.)
 * - protocol-relative URLs (`//evil.com`)
 * - backslash-prefixed paths (`/\evil.com`), which some browsers treat as
 *   protocol-relative when normalizing
 * - values containing control characters
 *
 * Falls back to `/dashboard` for anything that doesn't look like a plain
 * relative path starting with a single `/`.
 */
export function getSafeRedirectPath(
  next: string | null | undefined,
): string {
  if (!next) return DEFAULT_REDIRECT_PATH;
  if (CONTROL_CHAR_PATTERN.test(next)) return DEFAULT_REDIRECT_PATH;
  if (!next.startsWith("/")) return DEFAULT_REDIRECT_PATH;
  if (next.startsWith("//") || next.startsWith("/\\")) {
    return DEFAULT_REDIRECT_PATH;
  }

  return next;
}
