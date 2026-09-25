"use client";

import { OptionCard } from "@/components/onboarding/option-card";
import { ENGLISH_LEVELS, type EnglishLevel } from "@/lib/profile/types";
import { strings } from "@/lib/strings";

const LEVEL_COPY: Record<
  EnglishLevel,
  { title: string; hint: string }
> = {
  none: {
    title: strings.onboarding.steps.english.levels.none,
    hint: strings.onboarding.steps.english.levels.noneHint,
  },
  A1: {
    title: strings.onboarding.steps.english.levels.A1,
    hint: strings.onboarding.steps.english.levels.A1Hint,
  },
  A2: {
    title: strings.onboarding.steps.english.levels.A2,
    hint: strings.onboarding.steps.english.levels.A2Hint,
  },
  B1: {
    title: strings.onboarding.steps.english.levels.B1,
    hint: strings.onboarding.steps.english.levels.B1Hint,
  },
  B2: {
    title: strings.onboarding.steps.english.levels.B2,
    hint: strings.onboarding.steps.english.levels.B2Hint,
  },
  C1: {
    title: strings.onboarding.steps.english.levels.C1,
    hint: strings.onboarding.steps.english.levels.C1Hint,
  },
  C2: {
    title: strings.onboarding.steps.english.levels.C2,
    hint: strings.onboarding.steps.english.levels.C2Hint,
  },
};

export function EnglishLevelField({
  value,
  onChange,
}: {
  value: EnglishLevel | null;
  onChange: (level: EnglishLevel) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={strings.onboarding.steps.english.legend}
      className="grid gap-3"
    >
      {ENGLISH_LEVELS.map((level) => (
        <OptionCard
          key={level}
          selected={value === level}
          onSelect={() => onChange(level)}
          title={LEVEL_COPY[level].title}
          description={LEVEL_COPY[level].hint}
        />
      ))}
    </div>
  );
}
