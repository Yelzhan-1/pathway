"use client";

import { HandNote } from "@/components/pathway/primitives/Scribble";
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
        <h1 className="font-display text-balance text-[28px] font-bold leading-tight tracking-tight">{title}</h1>
        <HandNote hidden={false} color="forest" className="text-[22px]">
          {strings.onboarding.noteEditable}
        </HandNote>
      </div>

      <div aria-live="assertive">
        <FieldError>{error}</FieldError>
      </div>

      <FieldSet>
        <FieldLegend>{legend}</FieldLegend>
        <div className="flex flex-col gap-3">{children}</div>
      </FieldSet>

      <div className="sticky bottom-0 z-10 -mx-4 flex flex-col-reverse gap-3 border-t border-border bg-background/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:flex-row sm:items-center sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:backdrop-blur-none">
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
