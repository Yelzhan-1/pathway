"use client";

import { useState, useSyncExternalStore, useTransition } from "react";
import { toast } from "sonner";

import { Button, Display, TCard } from "@/components/pathway/ui/tropa";
import { submitFeedback } from "@/lib/actions/feedback";
import { feedbackStorageKey, localDayString } from "@/lib/feedback/storage";
import { strings } from "@/lib/strings";
import { cn } from "@/lib/utils";

const SCORES = [1, 2, 3, 4, 5] as const;
const STORE_EVENT = "pathway-feedback";

function readDone(page: string): boolean {
  try {
    return window.localStorage.getItem(feedbackStorageKey(page, localDayString())) === "1";
  } catch {
    return false;
  }
}

function writeDone(page: string) {
  try {
    window.localStorage.setItem(feedbackStorageKey(page, localDayString()), "1");
    window.dispatchEvent(new Event(STORE_EVENT));
  } catch {
    /* private mode */
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(STORE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(STORE_EVENT, onChange);
  };
}

export function FeedbackWidget({ page }: { page: string }) {
  const done = useSyncExternalStore(subscribe, () => readDone(page), () => false);
  const [helpful, setHelpful] = useState<number | null>(null);
  const [pickError, setPickError] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <TCard labelledBy="feedback-h" className="min-w-0">
      <Display as="h2" id="feedback-h" className="text-[16px]">
        {strings.feedback.title}
      </Display>
      {done ? (
        <p className="mt-2 text-[14px] font-semibold text-ink-2">{strings.feedback.thanks}</p>
      ) : (
        <form
          className="mt-3 grid gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            if (helpful == null) {
              setPickError(true);
              return;
            }
            setPickError(false);
            const comment = String(new FormData(event.currentTarget).get("comment") ?? "").trim();
            startTransition(async () => {
              const result = await submitFeedback({
                page,
                helpful,
                comment: comment || undefined,
              });
              if (!result.ok) {
                toast.error(result.error_ru);
                return;
              }
              writeDone(page);
            });
          }}
        >
          <p id="feedback-hint" className="text-[13px] font-medium text-muted-foreground">
            {strings.feedback.hint}
          </p>
          <div
            role="radiogroup"
            aria-labelledby="feedback-h"
            aria-describedby="feedback-hint"
            className="flex min-w-0 flex-wrap gap-2"
          >
            {SCORES.map((score) => (
              <button
                key={score}
                type="button"
                role="radio"
                aria-checked={helpful === score}
                aria-label={strings.feedback.score(score)}
                disabled={pending}
                onClick={() => {
                  setHelpful(score);
                  setPickError(false);
                }}
                className={cn(
                  "grid size-11 place-items-center rounded-full text-[15px] font-bold",
                  helpful === score
                    ? "bg-primary text-primary-foreground shadow-chunky"
                    : "bg-card text-foreground shadow-chunky-soft ring-1 ring-input",
                )}
              >
                {score}
              </button>
            ))}
          </div>
          {pickError ? (
            <p role="alert" className="text-[13px] font-semibold text-destructive">
              {strings.feedback.pick}
            </p>
          ) : null}
          <label className="block min-w-0 text-[13px] font-bold">
            {strings.feedback.comment}{" "}
            <span className="font-medium text-muted-foreground">({strings.common.optional})</span>
            <textarea
              name="comment"
              rows={3}
              maxLength={1000}
              disabled={pending}
              className="mt-1 w-full min-w-0 rounded-[18px] bg-background px-4 py-3 text-[14px] font-medium ring-1 ring-border [overflow-wrap:anywhere]"
            />
          </label>
          <Button type="submit" size="sm" disabled={pending}>
            {strings.feedback.submit}
          </Button>
        </form>
      )}
    </TCard>
  );
}
