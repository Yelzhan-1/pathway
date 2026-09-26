"use client";

import { useState } from "react";

import { StepForm } from "@/components/onboarding/step-form";
import { useOnboardingStep } from "@/components/onboarding/use-onboarding-step";
import { StatusField } from "@/components/profile/fields/status-field";
import type { ApplicantPath } from "@/lib/database.types";
import { statusStepSchema } from "@/lib/profile/schemas";
import type { ProfileData } from "@/lib/profile/types";
import { GRADUATE_GRADES, TRANSFER_YEARS } from "@/lib/profile/types";
import { strings } from "@/lib/strings";

export function StepStatus({ profile, step }: { profile: ProfileData; step: number }) {
  const [path, setPath] = useState<ApplicantPath | null>(profile.path);
  const [grade, setGrade] = useState(profile.grade_or_year);
  const { isPending, error, save } = useOnboardingStep(step, statusStepSchema, {
    path,
    grade_or_year: grade,
  });

  function handlePathChange(next: ApplicantPath) {
    setPath(next);
    const allowed = next === "transfer" ? TRANSFER_YEARS : GRADUATE_GRADES;
    if (grade && !(allowed as readonly string[]).includes(grade)) {
      setGrade(null);
    }
  }

  return (
    <StepForm
      title={strings.onboarding.steps.status.title}
      legend={strings.onboarding.steps.status.legend}
      error={error}
      isPending={isPending}
      showBack={false}
      onSubmit={() => save()}
    >
      <StatusField
        path={path}
        gradeOrYear={grade}
        onPathChange={handlePathChange}
        onGradeChange={setGrade}
      />
    </StepForm>
  );
}
