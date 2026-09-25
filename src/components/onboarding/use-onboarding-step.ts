"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  completeOnboardingAction,
  saveOnboardingStepAction,
  skipOnboardingStepAction,
} from "@/app/(onboarding)/onboarding/actions";
import { firstZodMessage } from "@/lib/profile/zod-error";
import type { ZodType } from "zod";

export function useOnboardingStep(step: number) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function goBack() {
    if (step <= 1) return;
    router.push(`/onboarding?step=${step - 1}`);
  }

  function save<T>(schema: ZodType<T>, values: unknown) {
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      setError(firstZodMessage(parsed.error));
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await saveOnboardingStepAction(step, parsed.data);
      if (result?.error) setError(result.error);
    });
  }

  function skip() {
    setError(null);
    startTransition(async () => {
      const result = await skipOnboardingStepAction(step);
      if (result?.error) setError(result.error);
    });
  }

  function complete() {
    setError(null);
    startTransition(async () => {
      const result = await completeOnboardingAction();
      if (result?.error) setError(result.error);
    });
  }

  return { isPending, error, setError, goBack, save, skip, complete };
}
