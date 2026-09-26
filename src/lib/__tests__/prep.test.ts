import { describe, expect, it } from "vitest";

import type { FitProfile, FitUniversity } from "@/lib/matching/types";
import { prepPlan, selectExamTargets } from "@/lib/prep/plan";

const TODAY = "2026-01-01";

function university(overrides: Partial<FitUniversity> = {}): FitUniversity {
  return {
    id: "a",
    slug: "a",
    name: "Alpha",
    country: "USA",
    city: null,
    region: "usa",
    majors: null,
    requirements: null,
    deadlines: [{ round: "RD", date: "2026-01-15", note: null }],
    tuition_usd_per_year: null,
    aid_for_internationals: null,
    scholarships: null,
    acceptance_rate: null,
    source_url: "https://alpha.edu",
    ielts_min: 6.5,
    toefl_min: null,
    duolingo_min: null,
    unt_min: null,
    sat_policy: "optional",
    sat_total_min: 1400,
    sat_total_max: null,
    ...overrides,
  };
}

const profile: FitProfile = {
  target_countries: [],
  intended_major: null,
  budget_usd: null,
  needs_scholarship: false,
  gpa: null,
  gpa_scale: null,
  exams: [{ code: "IELTS", score: 6, status: "taken" }],
};

describe("prepPlan", () => {
  it("picks the highest requirement and ignores optional SAT", () => {
    const targets = selectExamTargets([
      university(),
      university({
        id: "b",
        name: "Beta",
        ielts_min: 7,
        source_url: "https://beta.edu",
        sat_policy: "required",
        sat_total_min: 1500,
      }),
    ]);
    expect(targets.find((item) => item.code === "IELTS")).toMatchObject({
      target: 7,
      universityName: "Beta",
    });
    expect(targets.find((item) => item.code === "SAT")?.target).toBe(1500);
    expect(selectExamTargets([university()]).some((item) => item.code === "SAT")).toBe(false);
  });

  it("computes the gap and template weeks until a future deadline", () => {
    const plan = prepPlan(profile, [university({ ielts_min: 7 })], [
      {
        id: "exam-1",
        code: "IELTS",
        name: "IELTS",
        official_url: "https://ielts.org",
        source_url: "https://ielts.org/source",
        typical_test_dates_note: null,
      },
    ], TODAY);
    const ielts = plan.exams.find((item) => item.code === "IELTS");
    expect(ielts).toMatchObject({
      target: 7,
      current: 6,
      gap: 1,
      weeksUntilDeadline: 2,
      officialUrl: "https://ielts.org",
    });
    expect(plan.kind).toBe("template");
    expect(ielts?.milestones.every((item) => item.kind === "template")).toBe(true);
    expect(ielts?.lastCycleWarning).toBeNull();
  });

  it("flags a last-cycle deadline instead of inventing weeks", () => {
    const plan = prepPlan(
      profile,
      [
        university({
          deadlines: [{ round: "RD", date: "2025-01-01", note: "last cycle (2025-26), verify" }],
        }),
      ],
      [],
      TODAY,
    );
    const ielts = plan.exams[0];
    expect(ielts?.weeksUntilDeadline).toBeNull();
    expect(ielts?.lastCycleWarning).toContain("по прошлому циклу — проверьте на сайте вуза");
    expect(ielts?.lastCycleWarning).toContain("https://alpha.edu");
  });

  it("skips an exam the profile already meets", () => {
    const plan = prepPlan(
      { ...profile, exams: [{ code: "IELTS", score: 7, status: "taken" }] },
      [university({ ielts_min: 6.5 })],
      [],
      TODAY,
    );
    expect(plan.exams.some((item) => item.code === "IELTS")).toBe(false);
  });
});
