"use client";

import { Button } from "@/components/ui/button";
import { FieldError, FieldLegend, FieldSet } from "@/components/ui/field";
import { strings } from "@/lib/strings";

export function StepForm({
  title,
  legend,
  error,
  isPending,
  skippable = false,
  showBack = false,
  onBack,
  onSkip,
  onSubmit,
  submitLabel,
  children,
}: {
  title: string;
  legend: string;
  error: string | null;
  isPending: boolean;
  skippable?: boolean;
  showBack?: boolean;
  onBack?: () => void;
  onSkip?: () => void;
  onSubmit: () => void;
  submitLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      noValidate
      className="flex flex-col gap-6"
    >
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      </div>

      <div aria-live="assertive">
        <FieldError>{error}</FieldError>
      </div>

      <FieldSet>
        <FieldLegend>{legend}</FieldLegend>
        <div className="flex flex-col gap-3">{children}</div>
      </FieldSet>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
        {showBack ? (
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="min-h-11"
            onClick={onBack}
            disabled={isPending}
          >
            {strings.common.back}
          </Button>
        ) : null}
        {skippable ? (
          <Button
            type="button"
            variant="ghost"
            size="lg"
            className="min-h-11"
            onClick={onSkip}
            disabled={isPending}
          >
            {strings.common.skip}
          </Button>
        ) : null}
        <Button
          type="submit"
          size="lg"
          className="min-h-11 sm:ml-auto"
          disabled={isPending}
        >
          {submitLabel ?? (isPending ? strings.onboarding.completing : strings.common.next)}
        </Button>
      </div>
    </form>
  );
}
