"use client";

import { useState } from "react";

import { OptionCard } from "@/components/onboarding/option-card";
import { FieldError } from "@/components/ui/field";
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
  submitted = false,
  isOther: isOtherProp,
  onIsOtherChange,
}: {
  value: string;
  onChange: (major: string) => void;
  submitted?: boolean;
  isOther?: boolean;
  onIsOtherChange?: (next: boolean) => void;
}) {
  const [uncontrolled, setUncontrolled] = useState(
    () => value.trim().length > 0 && !isPresetMajor(value),
  );
  const isOther = isOtherProp ?? uncontrolled;

  function setOther(next: boolean) {
    if (isOtherProp === undefined) setUncontrolled(next);
    onIsOtherChange?.(next);
  }

  const selected = isOther ? OTHER_MAJOR_VALUE : value;

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
            onSelect={() => {
              setOther(false);
              onChange(major);
            }}
            title={major}
          />
        ))}
        <OptionCard
          selected={isOther}
          onSelect={() => {
            const switchingOn = !isOther;
            setOther(true);
            if (switchingOn && isPresetMajor(value)) onChange("");
          }}
          title={strings.common.other}
        />
      </div>
      {isOther ? (
        <div className="flex flex-col gap-2">
          <Label htmlFor="major-other">{strings.onboarding.steps.major.otherLabel}</Label>
          <Input
            id="major-other"
            className="h-11 min-h-11"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={strings.onboarding.steps.major.otherPlaceholder}
            aria-invalid={submitted && value.trim().length === 0}
          />
          {submitted && isOther && value.trim().length === 0 ? (
            <FieldError>{strings.profile.errors.majorOtherRequired}</FieldError>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
