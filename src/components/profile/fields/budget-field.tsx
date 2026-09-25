"use client";

import { OptionCard } from "@/components/onboarding/option-card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { BUDGET_OPTIONS } from "@/lib/profile/types";
import { strings } from "@/lib/strings";

export function BudgetField({
  budgetUsd,
  needsScholarship,
  onBudgetChange,
  onScholarshipChange,
}: {
  budgetUsd: number | null;
  needsScholarship: boolean;
  onBudgetChange: (value: number) => void;
  onScholarshipChange: (value: boolean) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div
        role="radiogroup"
        aria-label={strings.onboarding.steps.budget.legend}
        className="grid gap-3"
      >
        {BUDGET_OPTIONS.map((option) => (
          <OptionCard
            key={option.value}
            selected={budgetUsd === option.value}
            onSelect={() => onBudgetChange(option.value)}
            title={strings.onboarding.steps.budget.ranges[option.labelKey]}
          />
        ))}
      </div>
      <div className="flex min-h-11 items-center justify-between gap-3 rounded-xl border px-4 py-3">
        <Label htmlFor="needs-scholarship" className="text-sm leading-snug">
          {strings.onboarding.steps.budget.scholarship}
        </Label>
        <Switch
          id="needs-scholarship"
          checked={needsScholarship}
          onCheckedChange={(checked) => onScholarshipChange(Boolean(checked))}
        />
      </div>
    </div>
  );
}
