import { AddToCalendarButton } from "@/components/pathway/calendar/AddToCalendarButton";
import { deadlineIcsEvent, upcomingDeadlineIcsEvents } from "@/lib/calendar/deadlineEvents";
import { classifyDeadlines, LAST_CYCLE_WARNING_RU } from "@/lib/matching/deadlines";
import { roundLabel, publicNote } from "@/lib/labels/display";
import { dayMonth } from "@/lib/format";
import { strings } from "@/lib/strings";
import type { UniversityWithFit } from "@/lib/data/load";

export function DeadlineList({
  university,
  today,
}: {
  university: UniversityWithFit;
  today: string;
}) {
  const classified = classifyDeadlines(university.deadlines, today);
  const rows = [
    ...classified.upcoming.map((entry) => ({ entry, note: null as string | null })),
    ...classified.lastCycle.map((entry) => ({ entry, note: LAST_CYCLE_WARNING_RU })),
  ];

  if (rows.length === 0) {
    return <p className="text-[14px] font-medium text-muted-foreground">{strings.universities.noDeadlines}</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {classified.upcoming.length > 1 && (
        <AddToCalendarButton
          events={upcomingDeadlineIcsEvents([university], today)}
          filename={`pathway-${university.slug}-deadlines.ics`}
          label={strings.calendar.addAll}
          variant="ghost"
          size="sm"
          className="self-start px-2 text-[12.5px]"
        />
      )}
      <ul className="space-y-2">
        {rows.map(({ entry, note }) => (
          <li key={`${entry.round}-${entry.date}`} className="flex items-start gap-3 rounded-[16px] bg-card p-3 ring-1 ring-border">
            <span className="grid h-12 w-14 shrink-0 place-items-center rounded-[12px] bg-primary text-center text-[12px] font-extrabold text-primary-foreground">
              {dayMonth(entry.date)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-bold">{roundLabel(entry.round)}</p>
              {note ? <p className="mt-0.5 text-[13px] font-medium text-ink-2">{note}</p> : null}
              {!note && publicNote(entry.note) ? (
                <p className="mt-0.5 min-w-0 text-[12.5px] font-medium text-muted-foreground [overflow-wrap:anywhere]">
                  {publicNote(entry.note)}
                </p>
              ) : null}
              {!note && (
                <AddToCalendarButton
                  events={[deadlineIcsEvent(university, entry)]}
                  filename={`pathway-${university.slug}-${entry.date}.ics`}
                  variant="ghost"
                  size="sm"
                  className="mt-1.5 px-2 text-[12.5px]"
                />
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
