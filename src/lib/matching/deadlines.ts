export type DeadlineEntry = {
  round: string;
  date: string;
  note: string | null;
};

export const LAST_CYCLE_WARNING_RU =
  "по прошлому циклу — проверьте на сайте вуза";

const LAST_CYCLE_NOTE =
  /last\s+cycle|\bverify\b|прошл\p{L}*\s+цикл|проверьте/iu;

export function isLastCycleNote(note: string | null | undefined): boolean {
  if (!note) return false;
  return LAST_CYCLE_NOTE.test(note);
}

export function parseDeadlineEntries(value: unknown): DeadlineEntry[] {
  if (!Array.isArray(value)) return [];
  const entries: DeadlineEntry[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const rawDate = typeof row.date === "string" ? row.date.slice(0, 10) : "";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) continue;
    entries.push({
      round: typeof row.round === "string" && row.round.trim() ? row.round.trim() : "раунд",
      date: rawDate,
      note: typeof row.note === "string" ? row.note : null,
    });
  }
  return entries;
}

export function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

export type ClassifiedDeadlines = {
  upcoming: DeadlineEntry[];
  expired: DeadlineEntry[];
  lastCycle: DeadlineEntry[];
};

/** Past dates whose note says last cycle / verify are not treated as missed. */
export function classifyDeadlines(
  entries: DeadlineEntry[],
  today: string,
): ClassifiedDeadlines {
  const upcoming: DeadlineEntry[] = [];
  const expired: DeadlineEntry[] = [];
  const lastCycle: DeadlineEntry[] = [];
  for (const entry of entries) {
    if (entry.date >= today) {
      upcoming.push(entry);
      continue;
    }
    if (isLastCycleNote(entry.note)) {
      lastCycle.push(entry);
      continue;
    }
    expired.push(entry);
  }
  upcoming.sort((a, b) => a.date.localeCompare(b.date));
  return { upcoming, expired, lastCycle };
}

export function earliestUpcoming(
  entries: DeadlineEntry[],
  today: string,
): DeadlineEntry | null {
  return classifyDeadlines(entries, today).upcoming[0] ?? null;
}
