"use client";

import { useRef, useState } from "react";

import { StepForm } from "@/components/onboarding/step-form";
import { useOnboardingStep } from "@/components/onboarding/use-onboarding-step";
import { ExamsField, type ExamsFieldHandle } from "@/components/profile/fields/exams-field";
import { ACADEMIC_EXAM_CODES } from "@/lib/profile/exam-ranges";
import { examsStepSchema } from "@/lib/profile/schemas";
import type { ExamEntry, ProfileData } from "@/lib/profile/types";
import { strings } from "@/lib/strings";

export function StepExams({ profile, step }: { profile: ProfileData; step: number }) {
  const examsRef = useRef<ExamsFieldHandle>(null);
  const [exams, setExams] = useState<ExamEntry[]>(
    profile.exams.filter((exam) =>
      (ACADEMIC_EXAM_CODES as readonly string[]).includes(exam.code),
    ),
  );
  const { isPending, error, goBack, save, skip } = useOnboardingStep(
    step,
    examsStepSchema,
    { exams },
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
      onSubmit={() => {
        const pending = examsRef.current?.commitPending() ?? { ok: true as const, exams };
        if (!pending.ok) return;
        setExams(pending.exams);
        save(examsStepSchema, { exams: pending.exams });
      }}
    >
      <p className="text-sm text-muted-foreground">{strings.onboarding.steps.exams.hint}</p>
      <ExamsField
        ref={examsRef}
        value={exams}
        onChange={setExams}
        allowedCodes={ACADEMIC_EXAM_CODES}
      />
    </StepForm>
  );
}
