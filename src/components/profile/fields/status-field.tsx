"use client";

import { OptionCard } from "@/components/onboarding/option-card";
import {
  GRADUATE_GRADES,
  TRANSFER_YEARS,
} from "@/lib/profile/types";
import { strings } from "@/lib/strings";
import type { ApplicantPath } from "@/lib/database.types";

export function StatusField({
  path,
  gradeOrYear,
  onPathChange,
  onGradeChange,
}: {
  path: ApplicantPath | null;
  gradeOrYear: string | null;
  onPathChange: (path: ApplicantPath) => void;
  onGradeChange: (grade: string) => void;
}) {
  const grades = path === "transfer" ? TRANSFER_YEARS : GRADUATE_GRADES;

  return (
    <div className="flex flex-col gap-6">
      <div role="radiogroup" aria-label={strings.onboarding.steps.status.legend} className="grid gap-3">
        <OptionCard
          selected={path === "graduate"}
          onSelect={() => onPathChange("graduate")}
          title={strings.onboarding.steps.status.graduate}
          description={strings.onboarding.steps.status.graduateHint}
        />
        <OptionCard
          selected={path === "transfer"}
          onSelect={() => onPathChange("transfer")}
          title={strings.onboarding.steps.status.transfer}
          description={strings.onboarding.steps.status.transferHint}
        />
      </div>
      {path ? (
        <div
          id="grade_or_year"
          role="radiogroup"
          aria-label={strings.onboarding.steps.status.gradeLegend}
          className="grid scroll-mt-24 grid-cols-2 gap-3"
        >
          {grades.map((grade) => (
            <OptionCard
              key={grade}
              selected={gradeOrYear === grade}
              onSelect={() => onGradeChange(grade)}
              title={grade}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
