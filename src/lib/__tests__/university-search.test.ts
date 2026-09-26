import { describe, expect, it } from "vitest";

import { matchesDeadlineFilter, parseUniversityQuery } from "@/lib/universities/search";

describe("parseUniversityQuery", () => {
  it("keeps known filters and drops an unknown region", () => {
    const parsed = parseUniversityQuery({
      q: " stanford ",
      region: "usa",
      country: "USA",
      major: "CS",
      deadline: "upcoming",
    });
    expect(parsed.filters).toEqual({
      query: "stanford",
      region: "usa",
      country: "USA",
      major: "CS",
    });
    expect(parsed.deadline).toBe("upcoming");
    expect(parseUniversityQuery({ region: "mars" }).filters.region).toBeUndefined();
  });
});

describe("matchesDeadlineFilter", () => {
  const today = "2026-09-26";
  it("keeps upcoming and last-cycle rows without treating last-cycle as missed", () => {
    expect(
      matchesDeadlineFilter([{ round: "RD", date: "2026-10-01", note: null }], today, "upcoming"),
    ).toBe(true);
    expect(
      matchesDeadlineFilter(
        [{ round: "RD", date: "2026-01-01", note: "last cycle, verify" }],
        today,
        "last_cycle",
      ),
    ).toBe(true);
    expect(
      matchesDeadlineFilter([{ round: "RD", date: "2026-01-01", note: null }], today, "last_cycle"),
    ).toBe(false);
  });
});
