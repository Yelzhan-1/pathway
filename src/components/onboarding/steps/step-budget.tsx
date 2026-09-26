"use client";

import { useState } from "react";

import { StepForm } from "@/components/onboarding/step-form";
import { useOnboardingStep } from "@/components/onboarding/use-onboarding-step";
import { BudgetField } from "@/components/profile/fields/budget-field";
import { budgetStepSchema } from "@/lib/profile/schemas";
import type { ProfileData } from "@/lib/profile/types";
import { strings } from "@/lib/strings";

export function StepBudget({ profile, step }: { profile: ProfileData; step: number }) {
  const [budget, setBudget] = useState<number | null>(profile.budget_usd);
  const [needsScholarship, setNeedsScholarship] = useState(profile.needs_scholarship);
  const { isPending, error, goBack, save, skip } = useOnboardingStep(
    step,
    budgetStepSchema,
    { budget_usd: budget, needs_scholarship: needsScholarship },
  );

  return (
    <StepForm
      title={strings.onboarding.steps.budget.title}
      legend={strings.onboarding.steps.budget.legend}
      error={error}
      isPending={isPending}
      showBack
      skippable
      onBack={goBack}
      onSkip={skip}
      onSubmit={() => save()}
    >
      <BudgetField
        budgetUsd={budget}
        needsScholarship={needsScholarship}
        onBudgetChange={setBudget}
        onScholarshipChange={setNeedsScholarship}
      />
    </StepForm>
  );
}
