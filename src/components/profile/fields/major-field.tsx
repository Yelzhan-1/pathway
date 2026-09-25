"use client";

import { OptionCard } from "@/components/onboarding/option-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MAJOR_OPTIONS, OTHER_MAJOR_VALUE } from "@/lib/profile/types";
import { strings } from "@/lib/strings";

function isPresetMajor(major: string): boolean {
  return (MAJOR_OPTIONS as readonly string[]).includes(major);
}

export function MajorField({
  value,
  onChange,
}: {
  value: string;
  onChange: (major: string) => void;
}) {
  const usingOther = value.length > 0 && !isPresetMajor(value);
  const selected = usingOther ? OTHER_MAJOR_VALUE : value;

  return (
    <div className="flex flex-col gap-3">
      <div
        role="radiogroup"
        aria-label={strings.onboarding.steps.major.legend}
        className="grid grid-cols-1 gap-3 sm:grid-cols-2"
      >
        {MAJOR_OPTIONS.map((major) => (
          <OptionCard
            key={major}
            selected={selected === major}
            onSelect={() => onChange(major)}
            title={major}
          />
        ))}
        <OptionCard
          selected={selected === OTHER_MAJOR_VALUE}
          onSelect={() => onChange(usingOther ? value : "")}
          title={strings.common.other}
        />
      </div>
      {selected === OTHER_MAJOR_VALUE ? (
        <div className="flex flex-col gap-2">
          <Label htmlFor="major-other">{strings.onboarding.steps.major.otherLabel}</Label>
          <Input
            id="major-other"
            className="min-h-11"
            value={usingOther ? value : ""}
            onChange={(event) => onChange(event.target.value)}
            placeholder={strings.onboarding.steps.major.otherPlaceholder}
          />
        </div>
      ) : null}
    </div>
  );
}
