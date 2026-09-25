import { z } from "zod";

import { strings } from "@/lib/strings";

const emailField = z
  .string()
  .trim()
  .min(1, strings.auth.errors.emailInvalid)
  .pipe(z.email(strings.auth.errors.emailInvalid));

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, strings.auth.errors.invalidCredentials),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const signupSchema = z.object({
  fullName: z.string().trim().min(1, strings.auth.errors.fullNameRequired),
  email: emailField,
  password: z.string().min(8, strings.auth.errors.passwordMin),
});

export type SignupInput = z.infer<typeof signupSchema>;
