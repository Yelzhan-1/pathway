import { describe, expect, it } from "vitest";

import { buildIcsCalendar, type IcsEvent } from "../ics";

const NOW = new Date("2026-09-26T12:00:00Z");

describe("buildIcsCalendar", () => {
  it("wraps events in a VCALENDAR envelope with CRLF line endings", () => {
    const ics = buildIcsCalendar([{ uid: "a1", title: "MIT · Основной", date: "2026-11-01" }], NOW);
    expect(ics.startsWith("BEGIN:VCALENDAR\r\n")).toBe(true);
    expect(ics.endsWith("END:VCALENDAR\r\n")).toBe(true);
    expect(ics).toContain("VERSION:2.0");
    expect(ics).toContain("PRODID:-//Pathway//Deadlines//RU");
  });

  it("renders an all-day event with SUMMARY and DTSTART;VALUE=DATE", () => {
    const ics = buildIcsCalendar([{ uid: "a1", title: "MIT · Основной", date: "2026-11-01" }], NOW);
    expect(ics).toContain("BEGIN:VEVENT");
    expect(ics).toContain("SUMMARY:MIT · Основной");
    expect(ics).toContain("DTSTART;VALUE=DATE:20261101");
    expect(ics).toContain("END:VEVENT");
  });

  it("adds two VALARM reminders, 7 days and 1 day before", () => {
    const ics = buildIcsCalendar([{ uid: "a1", title: "MIT", date: "2026-11-01" }], NOW);
    expect(ics.match(/BEGIN:VALARM/g)).toHaveLength(2);
    expect(ics).toContain("TRIGGER:-P7D");
    expect(ics).toContain("TRIGGER:-P1D");
  });

  it("includes DESCRIPTION and URL only when provided", () => {
    const withExtras = buildIcsCalendar(
      [{ uid: "a1", title: "MIT", date: "2026-11-01", description: "заметка", url: "/universities/mit" }],
      NOW,
    );
    expect(withExtras).toContain("DESCRIPTION:заметка");
    expect(withExtras).toContain("URL:/universities/mit");

    const withoutExtras = buildIcsCalendar([{ uid: "a1", title: "MIT", date: "2026-11-01" }], NOW);
    expect(withoutExtras).not.toContain("URL:");
  });

  it("escapes commas, semicolons and newlines in text fields", () => {
    const events: IcsEvent[] = [{ uid: "a1", title: "MIT, EECS; программа", date: "2026-11-01" }];
    const ics = buildIcsCalendar(events, NOW);
    expect(ics).toContain("SUMMARY:MIT\\, EECS\\; программа");
  });

  it("renders one VEVENT block per input event", () => {
    const ics = buildIcsCalendar(
      [
        { uid: "a1", title: "MIT", date: "2026-11-01" },
        { uid: "a2", title: "Stanford", date: "2026-12-01" },
      ],
      NOW,
    );
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(2);
  });

  it("produces an empty-but-valid calendar for zero events", () => {
    const ics = buildIcsCalendar([], NOW);
    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("END:VCALENDAR");
    expect(ics).not.toContain("BEGIN:VEVENT");
  });
});
