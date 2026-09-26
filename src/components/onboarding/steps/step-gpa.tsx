"use client";

import { useState } from "react";

import { StepForm } from "@/components/onboarding/step-form";
import { useOnboardingStep } from "@/components/onboarding/use-onboarding-step";
import { GpaField } from "@/components/profile/fields/gpa-field";
import { gpaStepSchema } from "@/lib/profile/schemas";
import type { GpaScale, ProfileData } from "@/lib/profile/types";
import { strings } from "@/lib/strings";

export function StepGpa({ profile, step }: { profile: ProfileData; step: number }) {
  const [gpa, setGpa] = useState<number | null>(profile.gpa);
  const [scale, setScale] = useState<GpaScale | null>(
    profile.gpa_scale === 4 ||
      profile.gpa_scale === 5 ||
      profile.gpa_scale === 10 ||
      profile.gpa_scale === 100
      ? profile.gpa_scale
      : 5,
  );
  const { isPending, error, goBack, save, skip } = useOnboardingStep(
    step,
    gpaStepSchema,
    { gpa, gpa_scale: scale },
  );

  return (
    <StepForm
      title={strings.onboarding.steps.gpa.title}
      legend={strings.onboarding.steps.gpa.legend}
      error={error}
      isPending={isPending}
      showBack
      skippable
      onBack={goBack}
      onSkip={skip}
      onSubmit={() => save()}
    >
      <GpaField
        gpa={gpa}
        gpaScale={scale}
        onGpaChange={setGpa}
        onScaleChange={setScale}
      />
    </StepForm>
  );
}
