import { describe, expect, it } from "vitest";

import { fitUniversity } from "@/lib/matching/fit";
import type { FitProfile, FitUniversity } from "@/lib/matching/types";

const TODAY = "2026-09-26";

/** 11th grade demo: IELTS 6.5 taken, GPA set, no SAT. */
function demoProfile(overrides: Partial<FitProfile> = {}): FitProfile {
  return {
    target_countries: ["USA", "Kazakhstan", "South Korea"],
    intended_major: "Computer Science",
    budget_usd: 20000,
    needs_scholarship: true,
    gpa: 4.6,
    gpa_scale: 5,
    exams: [{ code: "IELTS", score: 6.5, status: "taken" }],
    ...overrides,
  };
}

function school(overrides: Partial<FitUniversity> = {}): FitUniversity {
  return {
    id: overrides.slug ?? "school",
    slug: "school",
    name: "School",
    country: "USA",
    city: null,
    region: "usa",
    majors: ["Computer Science"],
    requirements: { gpa_min: 3.5 },
    deadlines: [],
    tuition_usd_per_year: 60000,
    aid_for_internationals: "merit",
    scholarships: null,
    acceptance_rate: 0.4,
    source_url: "https://example.edu",
    ielts_min: 6.5,
    toefl_min: 90,
    duolingo_min: null,
    unt_min: null,
    sat_policy: "optional",
    sat_total_min: null,
    sat_total_max: null,
    ...overrides,
  };
}

describe("demo profile categories", () => {
  const profile = demoProfile();

  it("keeps Harvard, Stanford, MIT, and KAIST at dream", () => {
    const selective = [
      school({ slug: "harvard", name: "Harvard", acceptance_rate: 0.03, ielts_min: 7.5 }),
      school({ slug: "stanford", name: "Stanford", acceptance_rate: 0.04, ielts_min: 7 }),
      school({ slug: "mit", name: "MIT", acceptance_rate: 0.04, ielts_min: 7, sat_policy: "required", sat_total_min: 1520 }),
      school({
        slug: "kaist",
        name: "KAIST",
        country: "South Korea",
        region: "asia_other",
        acceptance_rate: 0.14,
        ielts_min: 6.5,
        requirements: { gpa_min: 3.0, highly_selective: true },
      }),
    ];
    for (const university of selective) {
      expect(fitUniversity(profile, university, TODAY).suggestedCategory, university.slug).toBe("dream");
    }
  });

  it("keeps SDU and KBTU as safety when academics are unpublished", () => {
    const local = school({
      country: "Kazakhstan",
      region: "kazakhstan",
      acceptance_rate: null,
      ielts_min: null,
      toefl_min: null,
      requirements: null,
      sat_policy: "not_used",
      tuition_usd_per_year: 3000,
      aid_for_internationals: "none",
    });
    for (const name of ["SDU", "KBTU"] as const) {
      const result = fitUniversity(
        demoProfile({ target_countries: ["Kazakhstan"], budget_usd: 5000, needs_scholarship: false }),
        { ...local, id: name, slug: name.toLowerCase(), name },
        TODAY,
      );
      expect(result.suggestedCategory, name).toBe("safety");
      expect(result.score, name).toBeLessThanOrEqual(60);
    }
  });

  it("moves a mid-selective university up when English and GPA clear the bar", () => {
    const mid = school({
      slug: "mid",
      name: "Mid State",
      acceptance_rate: 0.45,
      ielts_min: 7,
      requirements: { gpa_min: 3.6 },
      tuition_usd_per_year: 15000,
      aid_for_internationals: "none",
    });
    const now = fitUniversity(
      demoProfile({ budget_usd: 20000, needs_scholarship: false }),
      mid,
      TODAY,
    );
    const stronger = fitUniversity(
      demoProfile({
        budget_usd: 20000,
        needs_scholarship: false,
        gpa: 4.8,
        exams: [{ code: "IELTS", score: 7.5, status: "taken" }],
      }),
      mid,
      TODAY,
    );
    expect(now.suggestedCategory).toBe("dream");
    expect(stronger.suggestedCategory).toBe("safety");
    expect(stronger.score).toBeGreaterThan(now.score ?? 0);
  });
});
