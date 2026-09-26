"use client";

import { useState } from "react";

import { StepForm } from "@/components/onboarding/step-form";
import { useOnboardingStep } from "@/components/onboarding/use-onboarding-step";
import { MajorField } from "@/components/profile/fields/major-field";
import { canonicalizePreset } from "@/lib/profile/presets";
import { majorStepSchema } from "@/lib/profile/schemas";
import { MAJOR_OPTIONS, type ProfileData } from "@/lib/profile/types";
import { strings } from "@/lib/strings";

export function StepMajor({ profile, step }: { profile: ProfileData; step: number }) {
  const [major, setMajor] = useState(profile.intended_major ?? "");
  const { isPending, error, attempted, goBack, save, skip } = useOnboardingStep(
    step,
    majorStepSchema,
    { intended_major: major },
  );

  return (
    <StepForm
      title={strings.onboarding.steps.major.title}
      legend={strings.onboarding.steps.major.legend}
      error={error ? strings.profile.checkFields : null}
      isPending={isPending}
      showBack
      skippable
      onBack={goBack}
      onSkip={skip}
      onSubmit={() =>
        save(majorStepSchema, {
          intended_major: canonicalizePreset(major, MAJOR_OPTIONS),
        })
      }
    >
      <MajorField value={major} onChange={setMajor} submitted={attempted} />
    </StepForm>
  );
}
