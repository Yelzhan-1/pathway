"use client";

import { useState } from "react";

import { StepForm } from "@/components/onboarding/step-form";
import { useOnboardingStep } from "@/components/onboarding/use-onboarding-step";
import { IntakeYearField } from "@/components/profile/fields/intake-year-field";
import { intakeYearStepSchema } from "@/lib/profile/schemas";
import type { ProfileData } from "@/lib/profile/types";
import { strings } from "@/lib/strings";

export function StepIntakeYear({
  profile,
  step,
}: {
  profile: ProfileData;
  step: number;
}) {
  const { isPending, error, goBack, save } = useOnboardingStep(step);
  const [year, setYear] = useState<number | null>(profile.intake_year);

  return (
    <StepForm
      title={strings.onboarding.steps.intakeYear.title}
      legend={strings.onboarding.steps.intakeYear.legend}
      error={error}
      isPending={isPending}
      showBack
      onBack={goBack}
      onSubmit={() => save(intakeYearStepSchema, { intake_year: year })}
    >
      <IntakeYearField value={year} onChange={setYear} />
    </StepForm>
  );
}
