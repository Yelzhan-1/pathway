"use server";

import { redirect } from "next/navigation";

import { strings } from "@/lib/strings";
import { createClient } from "@/lib/supabase/server";
import { mapAuthErrorToMessage } from "@/lib/supabase/auth-errors";
import type { LoginInput, SignupInput } from "@/lib/validations/auth";

export type AuthActionResult = { error: string } | { error: null };

export async function loginAction(values: LoginInput): Promise<AuthActionResult> {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: values.email,
    password: values.password,
  });

  if (error) {
    return { error: mapAuthErrorToMessage(error) };
  }

  redirect("/dashboard");
}

export async function signupAction(values: SignupInput): Promise<AuthActionResult> {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email: values.email,
    password: values.password,
    options: {
      data: {
        full_name: values.fullName,
      },
    },
  });

  if (error) {
    return { error: mapAuthErrorToMessage(error) };
  }

  if (!data.session) {
    // Should not happen with email confirmation disabled, but fail safely.
    return { error: strings.auth.errors.generic };
  }

  redirect("/onboarding");
}
