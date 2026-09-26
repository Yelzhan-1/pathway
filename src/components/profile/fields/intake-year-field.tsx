"use client";

import { OptionCard } from "@/components/onboarding/option-card";
import { intakeYearOptions } from "@/lib/profile/types";
import { strings } from "@/lib/strings";

const YEARS = intakeYearOptions();

export function IntakeYearField({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (year: number) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={strings.onboarding.steps.intakeYear.legend}
      className="grid grid-cols-2 gap-3 sm:grid-cols-3"
    >
      {YEARS.map((year) => (
        <OptionCard
          key={year}
          selected={value === year}
          onSelect={() => onChange(year)}
          title={String(year)}
        />
      ))}
    </div>
  );
}
