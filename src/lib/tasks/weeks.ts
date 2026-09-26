import { utcWeekRange } from "@/lib/matching/dates";

export type WeekGroup<T> = {
  key: string;
  start: string | null;
  items: T[];
};

export function groupByDueWeek<T>(items: T[], dueOf: (item: T) => string | null | undefined): WeekGroup<T>[] {
  const buckets = new Map<string, T[]>();
  const undated: T[] = [];
  for (const item of items) {
    const due = dueOf(item)?.slice(0, 10) ?? null;
    if (!due) {
      undated.push(item);
      continue;
    }
    const start = utcWeekRange(due).start;
    const list = buckets.get(start) ?? [];
    list.push(item);
    buckets.set(start, list);
  }
  const groups: WeekGroup<T>[] = [...buckets.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([start, grouped]) => ({ key: start, start, items: grouped }));
  if (undated.length > 0) groups.push({ key: "none", start: null, items: undated });
  return groups;
}
