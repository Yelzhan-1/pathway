"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";

import { loginAction } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { strings } from "@/lib/strings";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";

export function LoginForm({ next }: { next?: string }) {
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (values: LoginInput) => {
    setFormError(null);
    startTransition(async () => {
      const result = await loginAction(values, next);
      if (result.error) {
        setFormError(result.error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <FieldGroup>
        <Field data-invalid={Boolean(errors.email)}>
          <FieldLabel htmlFor="email">{strings.auth.login.emailLabel}</FieldLabel>
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
            {strings.auth.login.passwordLabel}
          </FieldLabel>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
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
          {isPending ? strings.auth.login.submitting : strings.auth.login.submit}
        </Button>
      </FieldGroup>
    </form>
  );
}
