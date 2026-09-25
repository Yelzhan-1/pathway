"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";

import { signupAction } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { strings } from "@/lib/strings";
import { signupSchema, type SignupInput } from "@/lib/validations/auth";

export function SignupForm() {
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: { fullName: "", email: "", password: "" },
  });

  const onSubmit = (values: SignupInput) => {
    setFormError(null);
    startTransition(async () => {
      const result = await signupAction(values);
      if (result.error) {
        setFormError(result.error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <FieldGroup>
        <Field data-invalid={Boolean(errors.fullName)}>
          <FieldLabel htmlFor="fullName">
            {strings.auth.signup.fullNameLabel}
          </FieldLabel>
          <Input
            id="fullName"
            type="text"
            autoComplete="name"
            aria-invalid={Boolean(errors.fullName)}
            disabled={isPending}
            {...register("fullName")}
          />
          <FieldError errors={[errors.fullName]} />
        </Field>

        <Field data-invalid={Boolean(errors.email)}>
          <FieldLabel htmlFor="email">{strings.auth.signup.emailLabel}</FieldLabel>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            disabled={isPending}
            {...register("email")}
          />
          <FieldError errors={[errors.email]} />
        </Field>

        <Field data-invalid={Boolean(errors.password)}>
          <FieldLabel htmlFor="password">
            {strings.auth.signup.passwordLabel}
          </FieldLabel>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            aria-invalid={Boolean(errors.password)}
            disabled={isPending}
            {...register("password")}
          />
          <FieldError errors={[errors.password]} />
        </Field>

        {formError && (
          <p role="alert" className="text-sm text-destructive">
            {formError}
          </p>
        )}

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending && <Loader2 className="size-4 animate-spin" />}
          {isPending
            ? strings.auth.signup.submitting
            : strings.auth.signup.submit}
        </Button>
      </FieldGroup>
    </form>
  );
}
