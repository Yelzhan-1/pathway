import { describe, expect, it } from "vitest";

import { fitUniversity } from "@/lib/matching/fit";
import { shortestPath } from "@/lib/matching/path";
import type { FitProfile, FitUniversity } from "@/lib/matching/types";
import { hypotheticalProfile, whatIfSummary } from "@/lib/matching/what-if";
import { strings } from "@/lib/strings";

const TODAY = "2026-09-26";

function profile(overrides: Partial<FitProfile> = {}): FitProfile {
  return {
    target_countries: ["USA"],
    intended_major: "Computer Science",
    budget_usd: 40000,
    needs_scholarship: false,
    gpa: 4.6,
    gpa_scale: 5,
    exams: [{ code: "IELTS", score: 6.5, status: "taken" }],
    ...overrides,
  };
}

function university(overrides: Partial<FitUniversity> = {}): FitUniversity {
  return {
    id: "mid",
    slug: "mid-state",
    name: "Mid State",
    country: "USA",
    city: null,
    region: "usa",
    majors: ["Computer Science"],
    requirements: { gpa_min: 3.2 },
    deadlines: [],
    tuition_usd_per_year: 20000,
    aid_for_internationals: "none",
    scholarships: null,
    acceptance_rate: 0.4,
    source_url: "https://example.edu",
    ielts_min: 7.5,
    toefl_min: null,
    duolingo_min: null,
    unt_min: null,
    sat_policy: "optional",
    sat_total_min: null,
    sat_total_max: null,
    ...overrides,
  };
}

describe("hypotheticalProfile", () => {
  it("raises IELTS to 7.5 into the same category as the shortest path", () => {
    const start = profile();
    const school = university();
    const before = fitUniversity(start, school, TODAY);
    const next = hypotheticalProfile(start, {
      gpa: start.gpa,
      scores: { IELTS: 7.5 },
    });
    const after = fitUniversity(next, school, TODAY);
    const path = shortestPath(start, school, TODAY);
    expect(before.suggestedCategory).toBe("dream");
    expect(path.combos[0]?.category).toBe(after.suggestedCategory);
    expect(after.suggestedCategory).not.toBe(before.suggestedCategory);
  });

  it("keeps a sub-15% school at dream after the same IELTS raise", () => {
    const start = profile();
    const school = university({
      slug: "amherst",
      name: "Amherst",
      acceptance_rate: 0.09,
    });
    const next = hypotheticalProfile(start, { gpa: start.gpa, scores: { IELTS: 7.5 } });
    const after = fitUniversity(next, school, TODAY);
    const path = shortestPath(start, school, TODAY);
    expect(after.suggestedCategory).toBe("dream");
    expect(path.combos).toEqual([]);
    expect(path.reason_ru).toMatch(/конкурентн/i);
  });

  it("drops the category when GPA falls below the published bar", () => {
    const start = profile({ exams: [{ code: "IELTS", score: 7.5, status: "taken" }] });
    const school = university({ ielts_min: 6.5, requirements: { gpa_min: 3.4 } });
    const before = fitUniversity(start, school, TODAY);
    const next = hypotheticalProfile(start, { gpa: 0.6, scores: { IELTS: 7.5 } });
    const after = fitUniversity(next, school, TODAY);
    expect(before.suggestedCategory).toBe("safety");
    expect(after.suggestedCategory).toBe("dream");
    expect(
      whatIfSummary([{ before: before.suggestedCategory, after: after.suggestedCategory, grantUnlocked: false }]),
    ).not.toBe(strings.whatIf.none);
  });

  it("shows the unchanged line only when every category stays put", () => {
    expect(whatIfSummary([{ before: "safety", after: "safety", grantUnlocked: false }])).toBe(strings.whatIf.none);
    expect(whatIfSummary([{ before: "safety", after: "dream", grantUnlocked: false }])).toMatch(/ниже/);
  });

  it("feeds a numeric-string GPA scale into the engine", () => {
    const start = profile({
      gpa: "4.60" as unknown as number,
      gpa_scale: "5.00" as unknown as number,
      exams: [{ code: "IELTS", score: 7.5, status: "taken" }],
    });
    const school = university({ ielts_min: 6.5, requirements: { gpa_min: 3.4 } });
    const before = fitUniversity(start, school, TODAY);
    expect(before.checks.find((check) => check.key === "gpa")?.have).toContain("4.6");
    expect(before.suggestedCategory).toBe("safety");
    const next = hypotheticalProfile(start, { gpa: 0.6, scores: { IELTS: 7.5 } });
    const after = fitUniversity(next, school, TODAY);
    expect(after.checks.find((check) => check.key === "gpa")?.status).toBe("below");
    expect(after.suggestedCategory).toBe("dream");
  });
});
