"use client";

import { useRouter } from "next/navigation";

import { RoadProgress } from "@/components/pathway/onboarding/RoadProgress";
import { TCard } from "@/components/pathway/ui/tropa";
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
import { computeProfileCompleteness } from "@/lib/profile/completeness";
import type { ProfileData } from "@/lib/profile/types";
import { strings } from "@/lib/strings";

export function OnboardingWizard({
  profile,
  step,
  countries,
}: {
  profile: ProfileData;
  step: number;
  countries: string[];
}) {
  const router = useRouter();
  const completeness = computeProfileCompleteness(profile);

  return (
    <div className="flex flex-col gap-6">
      <RoadProgress
        className="mb-2 pb-8"
        labels={[...strings.onboarding.road]}
        current={step - 1}
        onJump={(index) => router.push(`/onboarding?step=${index + 1}`)}
      />
      <div className="xl:grid xl:grid-cols-[minmax(0,760px)_220px] xl:items-start xl:gap-8">
      <div className="min-w-0">
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
      <aside className="hidden xl:block">
        <TCard>
          <p className="font-display text-[18px] font-semibold">{strings.onboarding.growing}</p>
          <p className="mt-2 font-display text-[40px] font-bold text-primary">{completeness.percent}%</p>
        </TCard>
      </aside>
      </div>
    </div>
  );
}
