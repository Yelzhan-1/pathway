export function toUtcDateString(value: Date | string): string {
  if (typeof value === "string") {
    const day = value.slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) {
      throw new Error(`Expected YYYY-MM-DD, received ${value}`);
    }
    return day;
  }
  return value.toISOString().slice(0, 10);
}

export function shiftUtcDays(isoDate: string, days: number): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** Past due dates become `today + offsetDays` so new tasks are never already overdue. */
export function clampDueDate(
  due: string | null,
  today: string,
  offsetDays: number,
): string | null {
  if (!due) return null;
  if (daysBetween(today, due) >= 0) return due;
  return shiftUtcDays(today, Math.max(1, offsetDays));
}

export function daysBetween(fromIso: string, toIso: string): number {
  const from = Date.parse(`${fromIso}T00:00:00Z`);
  const to = Date.parse(`${toIso}T00:00:00Z`);
  return Math.round((to - from) / 86_400_000);
}

/** Monday–Sunday week containing `today`, in UTC. */
export function utcWeekRange(today: string): { start: string; end: string } {
  const date = new Date(`${today}T00:00:00Z`);
  const weekday = date.getUTCDay();
  const fromMonday = weekday === 0 ? 6 : weekday - 1;
  const start = shiftUtcDays(today, -fromMonday);
  return { start, end: shiftUtcDays(start, 6) };
}
