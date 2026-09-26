"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ZodType } from "zod";

import {
  completeOnboardingAction,
  saveOnboardingStepAction,
  skipOnboardingStepAction,
} from "@/app/(onboarding)/onboarding/actions";
import { firstZodMessage } from "@/lib/profile/zod-error";

export function useOnboardingStep(
  step: number,
  schema?: ZodType,
  values?: unknown,
) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [attempted, setAttempted] = useState(false);
  const serialized = JSON.stringify(values ?? null);

  const clientError =
    attempted && schema
      ? (() => {
          const parsed = schema.safeParse(JSON.parse(serialized) as unknown);
          return parsed.success ? null : firstZodMessage(parsed.error);
        })()
      : null;
  const error = clientError ?? serverError;

  function goBack() {
    if (step <= 1) return;
    router.push(`/onboarding?step=${step - 1}`);
  }

  function save<T>(nextSchema?: ZodType<T>, nextValues?: unknown) {
    const activeSchema = nextSchema ?? schema;
    const activeValues = nextValues ?? values;
    if (!activeSchema) return;
    setAttempted(true);
    const parsed = activeSchema.safeParse(activeValues);
    if (!parsed.success) {
      return;
    }
    setServerError(null);
    startTransition(async () => {
      const result = await saveOnboardingStepAction(step, parsed.data);
      if (result?.error) setServerError(result.error);
    });
  }

  function skip() {
    setServerError(null);
    startTransition(async () => {
      const result = await skipOnboardingStepAction(step);
      if (result?.error) setServerError(result.error);
    });
  }

  function complete() {
    setServerError(null);
    startTransition(async () => {
      const result = await completeOnboardingAction();
      if (result?.error) setServerError(result.error);
    });
  }

  return {
    isPending,
    error,
    setError: setServerError,
    attempted,
    goBack,
    save,
    skip,
    complete,
  };
}
