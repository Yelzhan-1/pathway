"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { dayMonth } from "@/lib/format";
import { deleteTask, restoreTask, updateTaskStatus } from "@/lib/actions/tasks";
import type { Database, TaskStatus } from "@/lib/database.types";
import { toUtcDateString, utcWeekRange } from "@/lib/matching/dates";
import { strings } from "@/lib/strings";
import { groupByDueWeek } from "@/lib/tasks/weeks";
import { cn } from "@/lib/utils";

type TaskRow = Database["public"]["Tables"]["tasks"]["Row"];

const STATUSES: TaskStatus[] = ["todo", "in_progress", "done"];

function weekHeading(start: string | null, today: string) {
  if (!start) return strings.tasks.noDate;
  if (start === utcWeekRange(today).start) return strings.tasks.thisWeek;
  return strings.tasks.weekFrom(dayMonth(start));
}

export function TaskList({ items }: { items: TaskRow[] }) {
  const [pending, startTransition] = useTransition();
  const today = toUtcDateString(new Date());
  const groups = groupByDueWeek(items, (item) => item.due_date);

  function run(action: () => Promise<{ ok: boolean; error_ru: string | null }>) {
    startTransition(async () => {
      const result = await action();
      if (!result.ok) toast.error(result.error_ru);
    });
  }

  return (
    <div className="flex flex-col gap-5">
      {groups.map((group) => (
        <section key={group.key} className="flex flex-col gap-2">
          <h2 className="text-[14px] font-extrabold text-ink-2">{weekHeading(group.start, today)}</h2>
          <ul className="grid gap-2">
            {group.items.map((task) => (
              <li key={task.id} className="rounded-[var(--radius-card)] bg-card p-4 shadow-card ring-1 ring-border">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-bold text-muted-foreground">{strings.tasks.source[task.source]}</p>
                    <h3 className="text-[15px] font-bold leading-tight [overflow-wrap:anywhere]">{task.title}</h3>
                    {task.due_date ? (
                      <p className="mt-1 text-[13px] font-semibold text-muted-foreground">{dayMonth(task.due_date.slice(0, 10))}</p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => {
                      startTransition(async () => {
                        const result = await deleteTask({ taskId: task.id });
                        if (!result.ok) {
                          toast.error(result.error_ru);
                          return;
                        }
                        toast(strings.tasks.deleted, {
                          action: {
                            label: strings.common.undo,
                            onClick: () => {
                              void restoreTask({
                                title: result.data.title,
                                description: result.data.description,
                                dueDate: result.data.dueDate?.slice(0, 10) ?? null,
                                status: result.data.status,
                                source: result.data.source,
                                relatedType: result.data.relatedType,
                                relatedId: result.data.relatedId,
                                roadmapKey: result.data.roadmapKey,
                              }).then((undo) => {
                                if (!undo.ok) toast.error(undo.error_ru);
                              });
                            },
                          },
                        });
                      });
                    }}
                    className="inline-flex min-h-11 items-center rounded-full px-3 text-[13px] font-bold text-muted-foreground hover:bg-secondary disabled:opacity-60"
                  >
                    {strings.tasks.delete}
                  </button>
                </div>
                {task.description ? (
                  <p className="mt-2 min-w-0 whitespace-pre-line break-all text-[13.5px] font-medium leading-snug text-muted-foreground [overflow-wrap:anywhere]">
                    {task.description}
                  </p>
                ) : null}
                <div className="mt-3 flex flex-wrap gap-2">
                  {STATUSES.map((status) => {
                    const on = task.status === status;
                    return (
                      <button
                        key={status}
                        type="button"
                        disabled={pending || on}
                        aria-pressed={on}
                        onClick={() => run(() => updateTaskStatus({ taskId: task.id, status }))}
                        className={cn(
                          "inline-flex min-h-11 items-center rounded-full px-3 text-[13px] font-bold ring-1 disabled:opacity-60",
                          on
                            ? "bg-primary text-primary-foreground ring-transparent"
                            : "bg-card text-foreground ring-border",
                        )}
                      >
                        {strings.tasks.status[status]}
                      </button>
                    );
                  })}
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
