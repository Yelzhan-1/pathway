"use client";

import { strings } from "@/lib/strings";

export function OnboardingProgress({
  step,
  total,
}: {
  step: number;
  total: number;
}) {
  const value = Math.round((step / total) * 100);

  return (
    <div className="mb-6 flex w-full flex-col gap-2">
      <p className="text-sm text-muted-foreground">
        {strings.onboarding.progress(step, total)}
      </p>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
        aria-label={strings.onboarding.progress(step, total)}
        className="relative h-1 w-full overflow-hidden rounded-full bg-muted"
      >
        <div
          className="h-full bg-primary transition-all"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
