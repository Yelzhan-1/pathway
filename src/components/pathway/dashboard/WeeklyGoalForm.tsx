"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { Button, TCard } from "@/components/pathway/ui/tropa";
import { setWeeklyGoal } from "@/lib/actions/preferences";
import { strings } from "@/lib/strings";

export function WeeklyGoalForm({ weeklyGoal }: { weeklyGoal: number | null }) {
  const [pending, startTransition] = useTransition();

  return (
    <TCard labelledBy="wg-h">
      <h2 id="wg-h" className="text-[16px] font-bold">
        {strings.dashboard.weeklyGoal}
      </h2>
      <p className="mt-1 text-[13px] font-medium text-muted-foreground">{strings.dashboard.weeklyGoalHint}</p>
      <form
        className="mt-3 flex flex-wrap gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          const value = String(new FormData(event.currentTarget).get("weeklyGoal") ?? "").trim();
          const weekly = value ? Number(value) : null;
          startTransition(async () => {
            const result = await setWeeklyGoal({ weeklyGoal: Number.isFinite(weekly) ? weekly : null });
            if (!result.ok) {
              toast.error(result.error_ru);
              return;
            }
            toast.success(strings.dashboard.weeklyGoalSaved);
          });
        }}
      >
        <label className="sr-only" htmlFor="weekly-goal">
          {strings.dashboard.weeklyGoal}
        </label>
        <input
          id="weekly-goal"
          name="weeklyGoal"
          type="number"
          min={1}
          max={50}
          aria-label={strings.dashboard.weeklyGoal}
          defaultValue={weeklyGoal ?? ""}
          className="h-11 w-24 rounded-full bg-background px-4 text-[14px] font-bold ring-1 ring-border"
        />
        <Button type="submit" size="sm" disabled={pending}>
          {strings.dashboard.weeklyGoalSave}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="soft"
          disabled={pending || weeklyGoal == null}
          onClick={() => {
            startTransition(async () => {
              const result = await setWeeklyGoal({ weeklyGoal: null });
              if (!result.ok) {
                toast.error(result.error_ru);
                return;
              }
              toast.success(strings.dashboard.weeklyGoalSaved);
            });
          }}
        >
          {strings.dashboard.weeklyGoalClear}
        </Button>
      </form>
    </TCard>
  );
}
