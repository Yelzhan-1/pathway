"use client";

import { OptionCard } from "@/components/onboarding/option-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GPA_SCALES, type GpaScale } from "@/lib/profile/types";
import { strings } from "@/lib/strings";

export function GpaField({
  gpa,
  gpaScale,
  onGpaChange,
  onScaleChange,
}: {
  gpa: number | null;
  gpaScale: number | null;
  onGpaChange: (gpa: number | null) => void;
  onScaleChange: (scale: GpaScale) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Label htmlFor="gpa">{strings.onboarding.steps.gpa.gpaLabel}</Label>
        <Input
          id="gpa"
          aria-label={strings.onboarding.steps.gpa.gpaLabel}
          className="h-11 min-h-11"
          type="number"
          inputMode="decimal"
          min={0}
          step="0.01"
          value={gpa ?? ""}
          onChange={(event) => {
            const next = event.target.value;
            onGpaChange(next === "" ? null : Number(next));
          }}
        />
      </div>
      <div
        role="radiogroup"
        aria-label={strings.onboarding.steps.gpa.scaleLabel}
        className="grid grid-cols-2 gap-3 sm:grid-cols-4"
      >
        {GPA_SCALES.map((scale) => (
          <OptionCard
            key={scale}
            selected={gpaScale === scale}
            onSelect={() => onScaleChange(scale)}
            title={String(scale)}
          />
        ))}
      </div>
    </div>
  );
}
