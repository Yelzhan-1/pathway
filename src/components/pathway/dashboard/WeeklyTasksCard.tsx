"use client";

import Link from "next/link";
import { useTransition } from "react";
import { toast } from "sonner";
import { ListTodo } from "lucide-react";
import type { WeekTask } from "@/types/pathway";
import { updateTaskStatus } from "@/lib/actions/tasks";
import { strings } from "@/lib/strings";
import { cn } from "@/lib/utils";
import { EmptyCta, HeaderLink, TCard, WidgetHeader } from "../ui/tropa";

type WeeklyGoal = { goal: number | null; due: number; done: number } | null;

function WeekLine({ streakDays, weeklyGoal }: { streakDays: number | null; weeklyGoal: WeeklyGoal }) {
  const hasStreak = streakDays != null && streakDays > 0;
  const hasGoal = weeklyGoal?.goal != null;
  const cls = "mt-3 text-[13px] font-bold text-ink-2";
  if (hasStreak && hasGoal) return <p className={cls}>{strings.dashboard.weekLine(streakDays, weeklyGoal.done, weeklyGoal.goal!)}</p>;
  if (hasStreak) return <p className={cls}>{strings.dashboard.weekLineNoGoal(streakDays)}</p>;
  if (hasGoal) return <p className={cls}>Цель на неделю: {weeklyGoal.done} из {weeklyGoal.goal}</p>;
  return (
    <Link href="/tasks" className="mt-3 inline-flex min-h-8 items-center text-[13px] font-bold text-primary hover:underline">
      {strings.dashboard.weekLineSetGoal}
    </Link>
  );
}

/** «На этой неделе»: up to 3 checkbox tasks + one line with streak/weekly goal (edited on /tasks). */
export function WeeklyTasksCard({
  tasks,
  streakDays,
  weeklyGoal,
}: {
  tasks: WeekTask[] | null;
  streakDays: number | null;
  weeklyGoal: WeeklyGoal;
}) {
  const [pending, startTransition] = useTransition();

  function complete(taskId: string) {
    startTransition(async () => {
      const result = await updateTaskStatus({ taskId, status: "done" });
      if (!result.ok) toast.error(result.error_ru);
    });
  }

  return (
    <TCard labelledBy="week-tasks-h" className="min-w-0">
      <WidgetHeader
        id="week-tasks-h"
        title={strings.dashboard.weekTasksTitle}
        right={<HeaderLink href="/tasks">{strings.dashboard.weekTasksAll}</HeaderLink>}
      />
      {!tasks?.length ? (
        <EmptyCta
          art={
            <span className="grid size-11 place-items-center rounded-[14px] bg-tone-sky-bg text-tone-sky-fg" aria-hidden>
              <ListTodo className="size-6" />
            </span>
          }
          title={strings.dashboard.weekTasksEmpty}
          text={strings.dashboard.weekTasksEmptyText}
          cta={strings.dashboard.weekTasksCta}
          href="/tasks"
        />
      ) : (
        <ul className="mt-3 space-y-2">
          {tasks.map((task) => (
            <li key={task.id}>
              <label className="flex min-h-11 min-w-0 items-center gap-3 rounded-[14px] bg-background px-3 py-2 ring-1 ring-border">
                <input
                  type="checkbox"
                  checked={task.done}
                  disabled={pending}
                  onChange={() => complete(task.id)}
                  className="size-5 shrink-0 accent-[var(--primary)]"
                  aria-label={task.title}
                />
                <span className={cn("min-w-0 flex-1 truncate text-[14px] font-bold", task.done && "text-muted-foreground line-through")}>
                  {task.title}
                </span>
              </label>
            </li>
          ))}
        </ul>
      )}
      <WeekLine streakDays={streakDays} weeklyGoal={weeklyGoal} />
    </TCard>
  );
}
