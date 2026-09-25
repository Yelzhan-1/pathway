import type { AuthError } from "@supabase/supabase-js";

import { strings } from "@/lib/strings";

/**
 * Maps Supabase Auth errors to clear Russian messages. Supabase error codes
 * are stable identifiers (`error.code`); message text is a fallback for
 * older SDK versions that don't set `code`.
 */
export function mapAuthErrorToMessage(error: AuthError): string {
  const code = error.code ?? "";
  const message = error.message.toLowerCase();

  if (code === "invalid_credentials" || message.includes("invalid login credentials")) {
    return strings.auth.errors.invalidCredentials;
  }

  if (
    code === "user_already_exists" ||
    code === "email_exists" ||
    message.includes("already registered") ||
    message.includes("already exists")
  ) {
    return strings.auth.errors.emailAlreadyRegistered;
  }

  if (code === "weak_password" || message.includes("password")) {
    return strings.auth.errors.weakPassword;
  }

  if (
    error.status === 0 ||
    message.includes("fetch") ||
    message.includes("network")
  ) {
    return strings.auth.errors.network;
  }

  return strings.auth.errors.generic;
}
