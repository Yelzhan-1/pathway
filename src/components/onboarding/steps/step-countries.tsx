"use client";

import { useState } from "react";

import { StepForm } from "@/components/onboarding/step-form";
import { useOnboardingStep } from "@/components/onboarding/use-onboarding-step";
import { CountriesField } from "@/components/profile/fields/countries-field";
import { countriesStepSchema } from "@/lib/profile/schemas";
import type { ProfileData } from "@/lib/profile/types";
import { strings } from "@/lib/strings";

export function StepCountries({
  profile,
  step,
  countries,
}: {
  profile: ProfileData;
  step: number;
  countries: string[];
}) {
  const [selected, setSelected] = useState<string[]>(profile.target_countries);
  const { isPending, error, goBack, save, skip } = useOnboardingStep(
    step,
    countriesStepSchema,
    { target_countries: selected },
  );

  return (
    <StepForm
      title={strings.onboarding.steps.countries.title}
      legend={strings.onboarding.steps.countries.legend}
      error={error}
      isPending={isPending}
      showBack
      skippable
      onBack={goBack}
      onSkip={skip}
      onSubmit={() => save()}
    >
      <CountriesField countries={countries} value={selected} onChange={setSelected} />
    </StepForm>
  );
}
