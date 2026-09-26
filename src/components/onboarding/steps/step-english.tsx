"use client";

import { useRef, useState } from "react";

import { StepForm } from "@/components/onboarding/step-form";
import { useOnboardingStep } from "@/components/onboarding/use-onboarding-step";
import { EnglishLevelField } from "@/components/profile/fields/english-field";
import { ExamsField, type ExamsFieldHandle } from "@/components/profile/fields/exams-field";
import { LANGUAGE_EXAM_CODES } from "@/lib/profile/exam-ranges";
import { englishStepSchema } from "@/lib/profile/schemas";
import type { EnglishLevel, ExamEntry, ProfileData } from "@/lib/profile/types";
import { strings } from "@/lib/strings";

export function StepEnglish({ profile, step }: { profile: ProfileData; step: number }) {
  const examsRef = useRef<ExamsFieldHandle>(null);
  const [level, setLevel] = useState<EnglishLevel | null>(
    (profile.english_level as EnglishLevel | null) ?? null,
  );
  const [exams, setExams] = useState<ExamEntry[]>(
    profile.exams.filter((exam) =>
      (LANGUAGE_EXAM_CODES as readonly string[]).includes(exam.code),
    ),
  );
  const { isPending, error, setError, goBack, save } = useOnboardingStep(
    step,
    englishStepSchema,
    { english_level: level, exams },
  );

  return (
    <StepForm
      title={strings.onboarding.steps.english.title}
      legend={strings.onboarding.steps.english.legend}
      error={error}
      isPending={isPending}
      showBack
      onBack={goBack}
      onSubmit={() => {
        const pending = examsRef.current?.commitPending() ?? { ok: true as const, exams };
        if (!pending.ok) {
          setError(pending.error);
          return;
        }
        setExams(pending.exams);
        save(englishStepSchema, { english_level: level, exams: pending.exams });
      }}
    >
      <EnglishLevelField value={level} onChange={setLevel} />
      <p className="text-sm text-muted-foreground">
        {strings.onboarding.steps.english.examsHint}
      </p>
      <ExamsField
        ref={examsRef}
        value={exams}
        onChange={setExams}
        allowedCodes={LANGUAGE_EXAM_CODES}
      />
    </StepForm>
  );
}
