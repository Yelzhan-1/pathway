"use client";

import { useState } from "react";

import { StepForm } from "@/components/onboarding/step-form";
import { useOnboardingStep } from "@/components/onboarding/use-onboarding-step";
import { ExamsField } from "@/components/profile/fields/exams-field";
import { examsStepSchema } from "@/lib/profile/schemas";
import type { ExamEntry, ProfileData } from "@/lib/profile/types";
import { strings } from "@/lib/strings";

const ACADEMIC_CODES = ["UNT", "SAT", "ACT", "AP", "IB_DP", "A_LEVEL", "NUET"] as const;

export function StepExams({ profile, step }: { profile: ProfileData; step: number }) {
  const { isPending, error, goBack, save, skip } = useOnboardingStep(step);
  const [exams, setExams] = useState<ExamEntry[]>(
    profile.exams.filter((exam) =>
      ACADEMIC_CODES.includes(exam.code as (typeof ACADEMIC_CODES)[number]),
    ),
  );

  return (
    <StepForm
      title={strings.onboarding.steps.exams.title}
      legend={strings.onboarding.steps.exams.legend}
      error={error}
      isPending={isPending}
      showBack
      skippable
      onBack={goBack}
      onSkip={skip}
      onSubmit={() => save(examsStepSchema, { exams })}
    >
      <p className="text-sm text-muted-foreground">{strings.onboarding.steps.exams.hint}</p>
      <ExamsField value={exams} onChange={setExams} allowedCodes={ACADEMIC_CODES} />
    </StepForm>
  );
}
