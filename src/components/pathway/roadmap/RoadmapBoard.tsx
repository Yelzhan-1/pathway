import { Collapsible } from "@/components/pathway/ui/Collapsible";
import { dayMonth } from "@/lib/format";
import { LAST_CYCLE_WARNING_RU } from "@/lib/matching/deadlines";
import { toUtcDateString, utcWeekRange } from "@/lib/matching/dates";
import type { RoadmapTaskDraft } from "@/lib/roadmap/build";
import { strings } from "@/lib/strings";
import { groupByDueWeek } from "@/lib/tasks/weeks";

function weekHeading(start: string | null, today: string) {
  if (!start) return strings.tasks.noDate;
  if (start === utcWeekRange(today).start) return strings.tasks.thisWeek;
  return strings.tasks.weekFrom(dayMonth(start));
}

export function RoadmapBoard({ tasks }: { tasks: RoadmapTaskDraft[] }) {
  const today = toUtcDateString(new Date());
  const groups = groupByDueWeek(tasks, (task) => task.dueDate);

  return (
    <div className="relative flex flex-col gap-6 border-l-2 border-dashed border-border pl-5">
      {groups.map((group) => (
        <section key={group.key} className="relative flex flex-col gap-2">
          <span className="absolute -left-[27px] top-0.5 size-3 rounded-full bg-primary ring-4 ring-background" aria-hidden />
          <h2 className="text-[14px] font-extrabold text-ink-2">{weekHeading(group.start, today)}</h2>
          <ul className="grid gap-2">
            {group.items.map((task) => (
              <li key={task.roadmapKey} className="min-w-0 rounded-[var(--radius-card)] bg-card p-4 shadow-card ring-1 ring-border">
                <h3 className="text-[15px] font-bold leading-tight [overflow-wrap:anywhere]">{task.title}</h3>
                {task.dueDate ? (
                  <p className="mt-1 text-[13px] font-semibold text-muted-foreground">{dayMonth(task.dueDate)}</p>
                ) : null}
                {task.lastCycle ? (
                  <p className="mt-2 text-[13px] font-medium text-ink-2">{LAST_CYCLE_WARNING_RU}</p>
                ) : null}
                {task.description ? (
                  <Collapsible className="mt-2">
                    <p className="min-w-0 whitespace-pre-line break-all [overflow-wrap:anywhere]">{task.description}</p>
                  </Collapsible>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
