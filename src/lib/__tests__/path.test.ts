import { describe, expect, it } from "vitest";

import { shortestPath } from "@/lib/matching/path";
import type { FitProfile, FitUniversity } from "@/lib/matching/types";

const TODAY = "2026-09-26";

function profile(overrides: Partial<FitProfile> = {}): FitProfile {
  return {
    target_countries: ["USA"],
    intended_major: "Computer Science",
    budget_usd: 30000,
    needs_scholarship: false,
    gpa: 3.6,
    gpa_scale: 4,
    exams: [{ code: "IELTS", score: 7, status: "taken" }],
    ...overrides,
  };
}

function university(overrides: Partial<FitUniversity> = {}): FitUniversity {
  return {
    id: "uni-1",
    slug: "uni",
    name: "Uni",
    country: "USA",
    city: "Boston",
    region: "usa",
    majors: ["Computer Science"],
    requirements: { gpa_min: 0.8 },
    deadlines: [{ round: "RD", date: "2026-01-01", note: "last cycle (2025-26), verify" }],
    tuition_usd_per_year: 20000,
    aid_for_internationals: "none",
    scholarships: null,
    acceptance_rate: 0.4,
    source_url: "https://example.edu/admit",
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

describe("shortestPath", () => {
  it("returns a clear reason when the university is already safety", () => {
    const result = shortestPath(profile(), university(), TODAY);
    expect(result.from).toBe("safety");
    expect(result.combos).toEqual([]);
    expect(result.reason_ru).toMatch(/запасной/i);
  });

  it("does not ask to take an optional SAT", () => {
    const result = shortestPath(
      profile({ exams: [{ code: "IELTS", score: 6, status: "taken" }] }),
      university({ sat_policy: "optional", sat_total_min: 1500 }),
      TODAY,
    );
    expect(result.from).toBe("dream");
    expect(result.combos.length).toBeGreaterThan(0);
    expect(result.combos.every((combo) => combo.levers.every((lever) => lever.examCode !== "SAT"))).toBe(
      true,
    );
    expect(result.combos[0]?.levers.some((lever) => lever.examCode === "IELTS")).toBe(true);
  });

  it("explains when a major mismatch cannot be closed by scores", () => {
    const result = shortestPath(
      profile({ intended_major: "Право" }),
      university({ majors: ["Computer Science"] }),
      TODAY,
    );
    expect(result.from).toBe("dream");
    expect(result.combos).toEqual([]);
    expect(result.reason_ru).toMatch(/специальность|бюджет|потолок/i);
  });

  it("explains a very selective school that stays dream", () => {
    const result = shortestPath(profile(), university({ acceptance_rate: 0.05 }), TODAY);
    expect(result.from).toBe("dream");
    expect(result.combos).toEqual([]);
    expect(result.reason_ru).toMatch(/конкурентн/i);
  });
});
