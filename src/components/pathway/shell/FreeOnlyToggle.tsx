"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { setFreeOnly } from "@/lib/actions/preferences";
import { strings } from "@/lib/strings";
import { cn } from "@/lib/utils";

export function FreeOnlyToggle({
  freeOnly,
  compact = false,
}: {
  freeOnly: boolean;
  compact?: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      role="switch"
      aria-checked={freeOnly}
      aria-label={strings.preference.freeOnly}
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          const result = await setFreeOnly({ freeOnly: !freeOnly });
          if (!result.ok) toast.error(result.error_ru);
        });
      }}
      className={cn(
        "inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full bg-card px-3 text-[13px] font-bold shadow-chunky-soft ring-1 ring-border disabled:opacity-60",
        compact && "px-2.5",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "relative inline-flex h-[18px] w-8 shrink-0 items-center rounded-full transition-colors",
          freeOnly ? "bg-primary" : "bg-input",
        )}
      >
        <span
          className={cn(
            "size-4 rounded-full bg-background transition-transform",
            freeOnly ? "translate-x-[14px]" : "translate-x-0.5",
          )}
        />
      </span>
      <span className={cn("max-w-[9.5rem] leading-tight sm:max-w-none", compact && "sr-only sm:not-sr-only sm:max-w-[9.5rem] lg:max-w-none")}>
        {strings.preference.freeOnly}
      </span>
    </button>
  );
}
