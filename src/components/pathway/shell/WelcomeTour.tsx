"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { X } from "lucide-react";

import { Button, Display, TCard } from "@/components/pathway/ui/tropa";
import {
  readTourDismissed,
  subscribeTourDismissed,
  TOUR_REOPEN_EVENT,
  writeTourDismissed,
} from "@/lib/tour/storage";
import { strings } from "@/lib/strings";

/** First-visit welcome tour: 5 short steps, skippable, remembered in localStorage. Reopenable from the «?» button in the shell. */
export function WelcomeTour() {
  const dismissed = useSyncExternalStore(subscribeTourDismissed, readTourDismissed, () => true);
  const [forceOpen, setForceOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    function onReopen() {
      setStep(0);
      setForceOpen(true);
    }
    window.addEventListener(TOUR_REOPEN_EVENT, onReopen);
    return () => window.removeEventListener(TOUR_REOPEN_EVENT, onReopen);
  }, []);

  const open = forceOpen || !dismissed;
  if (!open) return null;

  const tourSteps = strings.tour.steps;
  const current = tourSteps[step];
  const last = step === tourSteps.length - 1;

  function close() {
    setForceOpen(false);
    writeTourDismissed();
  }

  return (
    <div className="fixed inset-0 z-[60] grid place-items-end p-4 sm:place-items-center" role="dialog" aria-modal="true" aria-labelledby="tour-h">
      <div className="absolute inset-0 bg-forest-950/40" onClick={close} aria-hidden />
      <TCard className="relative z-10 w-full max-w-sm">
        <button
          type="button"
          onClick={close}
          aria-label={strings.common.close}
          className="absolute right-3 top-3 grid size-8 place-items-center rounded-full hover:bg-secondary"
        >
          <X className="size-4" aria-hidden />
        </button>
        <p className="text-[12px] font-bold text-muted-foreground">{strings.tour.progress(step + 1, tourSteps.length)}</p>
        <Display as="h2" id="tour-h" className="mt-1 text-[20px]">
          {current.title}
        </Display>
        <p className="mt-2 text-[14px] font-medium leading-snug text-ink-2">{current.text}</p>
        <div className="mt-4 flex items-center justify-between gap-2">
          <button type="button" onClick={close} className="min-h-9 text-[13px] font-bold text-muted-foreground hover:underline">
            {strings.tour.skip}
          </button>
          <Button type="button" size="sm" onClick={() => (last ? close() : setStep((value) => value + 1))}>
            {last ? strings.common.done : strings.common.next}
          </Button>
        </div>
      </TCard>
    </div>
  );
}
