"use client";

import { useState } from "react";

import { StepForm } from "@/components/onboarding/step-form";
import { useOnboardingStep } from "@/components/onboarding/use-onboarding-step";
import { CityField } from "@/components/profile/fields/city-field";
import { cityStepSchema } from "@/lib/profile/schemas";
import type { ProfileData } from "@/lib/profile/types";
import { strings } from "@/lib/strings";

export function StepCity({ profile, step }: { profile: ProfileData; step: number }) {
  const [city, setCity] = useState(profile.city ?? "");
  const { isPending, error, attempted, goBack, save } = useOnboardingStep(step, cityStepSchema, {
    city,
  });

  return (
    <StepForm
      title={strings.onboarding.steps.city.title}
      legend={strings.onboarding.steps.city.legend}
      error={error}
      isPending={isPending}
      showBack
      onBack={goBack}
      onSubmit={() => save()}
    >
      <CityField value={city} onChange={setCity} submitted={attempted} />
    </StepForm>
  );
}
