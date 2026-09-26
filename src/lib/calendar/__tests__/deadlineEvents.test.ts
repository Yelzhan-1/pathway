import { describe, expect, it } from "vitest";

import { deadlineIcsEvent, upcomingDeadlineIcsEvents, type DeadlineUniversitySource } from "../deadlineEvents";

const TODAY = "2026-09-26";

const mit: DeadlineUniversitySource = {
  id: "u-mit",
  slug: "mit",
  name: "MIT",
  deadlines: [
    { round: "main", date: "2026-11-01", note: null },
    { round: "early", date: "2026-01-01", note: null },
  ],
};

describe("deadlineIcsEvent", () => {
  it("builds a title from the university name and localized round label", () => {
    const event = deadlineIcsEvent(mit, { round: "main", date: "2026-11-01" });
    expect(event.title).toBe("MIT · Основной");
    expect(event.date).toBe("2026-11-01");
    expect(event.url).toBe("/universities/mit");
  });

  it("builds a stable uid from university id, round and date", () => {
    const event = deadlineIcsEvent(mit, { round: "main", date: "2026-11-01" });
    expect(event.uid).toBe("u-mit-main-2026-11-01");
  });
});

describe("upcomingDeadlineIcsEvents", () => {
  it("only includes deadlines on or after today", () => {
    const events = upcomingDeadlineIcsEvents([mit], TODAY);
    expect(events).toHaveLength(1);
    expect(events[0].date).toBe("2026-11-01");
  });

  it("excludes past deadlines without a last-cycle note", () => {
    const events = upcomingDeadlineIcsEvents([mit], TODAY);
    expect(events.some((event) => event.date === "2026-01-01")).toBe(false);
  });

  it("returns an empty list when there are no upcoming deadlines", () => {
    const past: DeadlineUniversitySource = { ...mit, deadlines: [{ round: "main", date: "2020-01-01", note: null }] };
    expect(upcomingDeadlineIcsEvents([past], TODAY)).toEqual([]);
  });

  it("combines deadlines across multiple universities", () => {
    const stanford: DeadlineUniversitySource = {
      id: "u-stanford",
      slug: "stanford",
      name: "Stanford",
      deadlines: [{ round: "main", date: "2026-12-01", note: null }],
    };
    const events = upcomingDeadlineIcsEvents([mit, stanford], TODAY);
    expect(events.map((event) => event.title)).toEqual(["MIT · Основной", "Stanford · Основной"]);
  });
});
