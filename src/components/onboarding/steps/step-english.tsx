"use client";

import { useState } from "react";

import { StepForm } from "@/components/onboarding/step-form";
import { useOnboardingStep } from "@/components/onboarding/use-onboarding-step";
import { EnglishLevelField } from "@/components/profile/fields/english-field";
import { ExamsField } from "@/components/profile/fields/exams-field";
import { englishStepSchema } from "@/lib/profile/schemas";
import type { EnglishLevel, ExamEntry, ProfileData } from "@/lib/profile/types";
import { strings } from "@/lib/strings";

const LANGUAGE_CODES = ["IELTS", "TOEFL_IBT", "DET"] as const;

export function StepEnglish({ profile, step }: { profile: ProfileData; step: number }) {
  const { isPending, error, goBack, save } = useOnboardingStep(step);
  const [level, setLevel] = useState<EnglishLevel | null>(
    (profile.english_level as EnglishLevel | null) ?? null,
  );
  const [exams, setExams] = useState<ExamEntry[]>(
    profile.exams.filter((exam) =>
      LANGUAGE_CODES.includes(exam.code as (typeof LANGUAGE_CODES)[number]),
    ),
  );

  return (
    <StepForm
      title={strings.onboarding.steps.english.title}
      legend={strings.onboarding.steps.english.legend}
      error={error}
      isPending={isPending}
      showBack
      onBack={goBack}
      onSubmit={() => save(englishStepSchema, { english_level: level, exams })}
    >
      <EnglishLevelField value={level} onChange={setLevel} />
      <p className="text-sm text-muted-foreground">
        {strings.onboarding.steps.english.examsHint}
      </p>
      <ExamsField value={exams} onChange={setExams} allowedCodes={LANGUAGE_CODES} />
    </StepForm>
  );
}
