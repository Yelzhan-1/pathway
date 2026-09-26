/**
 * Minimal RFC 5545 (iCalendar) writer for «Добавить в календарь» / .ics export.
 * Deadlines have no exact time, so every event is an all-day VEVENT with two
 * VALARM reminders (7 days and 1 day before).
 */

export type IcsEvent = {
  /** Stable id, unique within the exported file. */
  uid: string;
  title: string;
  /** YYYY-MM-DD. */
  date: string;
  description?: string | null;
  /** Relative or absolute link back to the deadline's page. */
  url?: string | null;
};

function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

function icsDate(date: string): string {
  return date.replace(/-/g, "");
}

function formatIcsTimestamp(date: Date): string {
  return `${date.toISOString().replace(/[-:]/g, "").split(".")[0]}Z`;
}

function buildAlarmLines(triggerDuration: string, title: string): string[] {
  return [
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    `TRIGGER:${triggerDuration}`,
    `DESCRIPTION:${escapeIcsText(title)}`,
    "END:VALARM",
  ];
}

function buildEventLines(event: IcsEvent, stamp: string): string[] {
  const lines = [
    "BEGIN:VEVENT",
    `UID:${escapeIcsText(event.uid)}@pathway`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${icsDate(event.date)}`,
    `SUMMARY:${escapeIcsText(event.title)}`,
  ];
  if (event.description?.trim()) lines.push(`DESCRIPTION:${escapeIcsText(event.description.trim())}`);
  if (event.url?.trim()) lines.push(`URL:${event.url.trim()}`);
  lines.push(...buildAlarmLines("-P7D", event.title), ...buildAlarmLines("-P1D", event.title), "END:VEVENT");
  return lines;
}

/** Builds a full .ics file (CRLF line endings per RFC 5545) from one or more deadline events. */
export function buildIcsCalendar(events: readonly IcsEvent[], now: Date = new Date()): string {
  const stamp = formatIcsTimestamp(now);
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Pathway//Deadlines//RU",
    "CALSCALE:GREGORIAN",
    ...events.flatMap((event) => buildEventLines(event, stamp)),
    "END:VCALENDAR",
  ];
  return `${lines.join("\r\n")}\r\n`;
}
