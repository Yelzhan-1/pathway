import { roundLabel } from "@/lib/labels/display";
import { classifyDeadlines, type DeadlineEntry } from "@/lib/matching/deadlines";

import type { IcsEvent } from "./ics";

export type DeadlineUniversitySource = {
  id: string;
  slug: string;
  name: string;
  deadlines: DeadlineEntry[];
};

/** One deadline row → one calendar event. Title/date come straight from the catalog — nothing invented. */
export function deadlineIcsEvent(
  university: Pick<DeadlineUniversitySource, "id" | "slug" | "name">,
  entry: Pick<DeadlineEntry, "round" | "date">,
): IcsEvent {
  return {
    uid: `${university.id}-${entry.round}-${entry.date}`,
    title: `${university.name} · ${roundLabel(entry.round)}`,
    date: entry.date,
    url: `/universities/${university.slug}`,
  };
}

/** Every still-upcoming deadline across one or more universities — for the «все мои дедлайны» export. */
export function upcomingDeadlineIcsEvents(
  universities: readonly DeadlineUniversitySource[],
  today: string,
): IcsEvent[] {
  return universities.flatMap((university) =>
    classifyDeadlines(university.deadlines, today).upcoming.map((entry) => deadlineIcsEvent(university, entry)),
  );
}
