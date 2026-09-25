import { z } from "zod";

import { strings } from "@/lib/strings";

const emailField = z
  .string()
  .trim()
  .min(1, strings.auth.errors.emailRequired)
  .pipe(z.email(strings.auth.errors.emailInvalid));

// Signup passwords must be at least 8 characters and contain at least one
// letter and one digit. Both checks share the same message so the (deduped)
// FieldError shows a single, clear line even when both conditions fail.
const strongPasswordField = z
  .string()
  .min(8, strings.auth.errors.passwordWeak)
  .regex(/(?=.*[A-Za-zА-Яа-яЁё])(?=.*\d)/, strings.auth.errors.passwordWeak);

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, strings.auth.errors.passwordRequired),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const signupSchema = z.object({
  fullName: z.string().trim().min(1, strings.auth.errors.fullNameRequired),
  email: emailField,
  password: strongPasswordField,
});

export type SignupInput = z.infer<typeof signupSchema>;
