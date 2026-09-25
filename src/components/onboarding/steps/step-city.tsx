"use client";

import { useState } from "react";

import { StepForm } from "@/components/onboarding/step-form";
import { useOnboardingStep } from "@/components/onboarding/use-onboarding-step";
import { CityField } from "@/components/profile/fields/city-field";
import { cityStepSchema } from "@/lib/profile/schemas";
import type { ProfileData } from "@/lib/profile/types";
import { strings } from "@/lib/strings";

export function StepCity({ profile, step }: { profile: ProfileData; step: number }) {
  const { isPending, error, goBack, save } = useOnboardingStep(step);
  const [city, setCity] = useState(profile.city ?? "");

  return (
    <StepForm
      title={strings.onboarding.steps.city.title}
      legend={strings.onboarding.steps.city.legend}
      error={error}
      isPending={isPending}
      showBack
      onBack={goBack}
      onSubmit={() => save(cityStepSchema, { city })}
    >
      <CityField value={city} onChange={setCity} />
    </StepForm>
  );
}
