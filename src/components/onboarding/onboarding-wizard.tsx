"use client";

import { OnboardingProgress } from "@/components/onboarding/progress-indicator";
import { StepBudget } from "@/components/onboarding/steps/step-budget";
import { StepCity } from "@/components/onboarding/steps/step-city";
import { StepCountries } from "@/components/onboarding/steps/step-countries";
import { StepEnglish } from "@/components/onboarding/steps/step-english";
import { StepExams } from "@/components/onboarding/steps/step-exams";
import { StepGpa } from "@/components/onboarding/steps/step-gpa";
import { StepIntakeYear } from "@/components/onboarding/steps/step-intake-year";
import { StepMajor } from "@/components/onboarding/steps/step-major";
import { StepStatus } from "@/components/onboarding/steps/step-status";
import { StepSummary } from "@/components/onboarding/steps/step-summary";
import { TOTAL_ONBOARDING_STEPS } from "@/lib/profile/onboarding-steps";
import type { ProfileData } from "@/lib/profile/types";

export function OnboardingWizard({
  profile,
  step,
  countries,
}: {
  profile: ProfileData;
  step: number;
  countries: string[];
}) {
  return (
    <div className="flex flex-col gap-2">
      <OnboardingProgress step={step} total={TOTAL_ONBOARDING_STEPS} />
      {step === 1 ? <StepStatus profile={profile} step={1} /> : null}
      {step === 2 ? <StepCity profile={profile} step={2} /> : null}
      {step === 3 ? <StepMajor profile={profile} step={3} /> : null}
      {step === 4 ? (
        <StepCountries profile={profile} step={4} countries={countries} />
      ) : null}
      {step === 5 ? <StepBudget profile={profile} step={5} /> : null}
      {step === 6 ? <StepEnglish profile={profile} step={6} /> : null}
      {step === 7 ? <StepExams profile={profile} step={7} /> : null}
      {step === 8 ? <StepGpa profile={profile} step={8} /> : null}
      {step === 9 ? <StepIntakeYear profile={profile} step={9} /> : null}
      {step === 10 ? <StepSummary profile={profile} /> : null}
    </div>
  );
}
