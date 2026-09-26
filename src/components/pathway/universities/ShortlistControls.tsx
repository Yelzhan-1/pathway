"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import {
  addToShortlist,
  changeShortlistCategory,
  removeFromShortlist,
} from "@/lib/actions/shortlist";
import type { FitCategory } from "@/lib/matching/types";
import { strings } from "@/lib/strings";
import { cn } from "@/lib/utils";

const CATEGORIES: FitCategory[] = ["dream", "target", "safety"];

export function ShortlistControls({
  universityId,
  current,
}: {
  universityId: string;
  current: FitCategory | null;
}) {
  const [pending, startTransition] = useTransition();

  function run(action: () => Promise<{ ok: boolean; error_ru: string | null }>) {
    startTransition(async () => {
      const result = await action();
      if (!result.ok) toast.error(result.error_ru);
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {CATEGORIES.map((category) => {
        const on = current === category;
        return (
          <button
            key={category}
            type="button"
            disabled={pending || on}
            aria-pressed={on}
            onClick={() =>
              run(() =>
                current
                  ? changeShortlistCategory({ universityId, category })
                  : addToShortlist({ universityId, category }),
              )
            }
            className={cn(
              "inline-flex min-h-11 items-center rounded-full px-3 text-[13px] font-bold ring-1 disabled:opacity-60",
              on ? "bg-primary text-primary-foreground ring-transparent" : "bg-card text-foreground ring-border",
            )}
          >
            {strings.fit.category[category]}
          </button>
        );
      })}
      {current ? (
        <button
          type="button"
          disabled={pending}
          onClick={() => run(() => removeFromShortlist({ universityId }))}
          className="inline-flex min-h-11 items-center rounded-full px-3 text-[13px] font-bold text-muted-foreground hover:bg-secondary disabled:opacity-60"
        >
          {strings.universities.remove}
        </button>
      ) : null}
    </div>
  );
}
