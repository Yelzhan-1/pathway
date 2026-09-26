import { describe, expect, it } from "vitest";

import { NOT_IN_DATABASE_RU } from "@/lib/agent/prompt";
import { englishRequirementLabel } from "@/lib/agent/university-facts";
import { fitUniversity } from "@/lib/matching/fit";
import type { FitProfile, FitUniversity } from "@/lib/matching/types";

const TODAY = "2026-09-26";

/** Args the model sends for «Какой IELTS нужен для KAIST?»: getUniversityDetails({ slug: "KAIST" }). */
const DEMO: FitProfile = {
  target_countries: ["South Korea"],
  intended_major: "Компьютерные науки",
  budget_usd: 10000,
  needs_scholarship: true,
  gpa: 4.6,
  gpa_scale: 5,
  exams: [{ code: "IELTS", score: 6.5, status: "taken" }],
};

function school(overrides: Partial<FitUniversity>): FitUniversity {
  return {
    id: "school",
    slug: "school",
    name: "School",
    country: "USA",
    city: null,
    region: null,
    majors: ["Computer Science"],
    requirements: null,
    deadlines: [],
    tuition_usd_per_year: null,
    aid_for_internationals: null,
    scholarships: null,
    acceptance_rate: null,
    source_url: "https://example.edu",
    ielts_min: null,
    toefl_min: null,
    duolingo_min: null,
    unt_min: null,
    sat_policy: null,
    sat_total_min: null,
    sat_total_max: null,
    ...overrides,
  };
}

describe("english requirement the assistant returns", () => {
  it("says Нет данных for KAIST, the same empty minimum the university card shows", () => {
    const kaist = school({
      id: "kaist",
      slug: "kaist",
      name: "KAIST",
      country: "South Korea",
      majors: ["Computer Science (School of Computing)"],
      requirements: {
        other: "English test scores not verified on official page (secondary sources say recommended, not mandatory).",
        ielts_min: null,
        toefl_min: null,
      },
    });
    const fit = fitUniversity(DEMO, kaist, TODAY);
    const english = fit.checks.find((check) => check.key === "english");
    const label = englishRequirementLabel(fit);
    expect(english?.need).toBeNull();
    expect(label).toBe("Нет данных");
    expect(label).not.toContain(NOT_IN_DATABASE_RU);
  });

  it("returns the same IELTS/TOEFL line the card shows when a minimum is published", () => {
    const mit = school({
      slug: "mit",
      name: "MIT",
      ielts_min: 7,
      toefl_min: 90,
      duolingo_min: 120,
    });
    const fit = fitUniversity(DEMO, mit, TODAY);
    const english = fit.checks.find((check) => check.key === "english");
    expect(englishRequirementLabel(fit)).toBe(english?.need);
    expect(english?.need).toMatch(/IELTS 7/);
    expect(english?.need).toMatch(/TOEFL/);
  });
});
