"use client";

import { useState } from "react";

import { StepForm } from "@/components/onboarding/step-form";
import { useOnboardingStep } from "@/components/onboarding/use-onboarding-step";
import { MajorField } from "@/components/profile/fields/major-field";
import { majorStepSchema } from "@/lib/profile/schemas";
import type { ProfileData } from "@/lib/profile/types";
import { strings } from "@/lib/strings";

export function StepMajor({ profile, step }: { profile: ProfileData; step: number }) {
  const { isPending, error, goBack, save, skip } = useOnboardingStep(step);
  const [major, setMajor] = useState(profile.intended_major ?? "");

  return (
    <StepForm
      title={strings.onboarding.steps.major.title}
      legend={strings.onboarding.steps.major.legend}
      error={error}
      isPending={isPending}
      showBack
      skippable
      onBack={goBack}
      onSkip={skip}
      onSubmit={() => save(majorStepSchema, { intended_major: major })}
    >
      <MajorField value={major} onChange={setMajor} />
    </StepForm>
  );
}
