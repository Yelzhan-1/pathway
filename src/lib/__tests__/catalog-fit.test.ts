import { describe, expect, it } from "vitest";

import { CATALOG_ACCEPTANCE_RATE, coerceFinite, resolveAcceptanceRate } from "@/data/catalog-acceptance";
import { CATALOG_SNAPSHOT } from "@/data/catalog-snapshot";
import { acceptanceFraction, fitUniversity } from "@/lib/matching/fit";
import type { FitProfile, FitUniversity } from "@/lib/matching/types";

const TODAY = "2026-09-26";

/** Demo account: 11th grade, IELTS 6.5, GPA 4.60/5, no SAT, needs a scholarship. */
const DEMO: FitProfile = {
  target_countries: ["Kazakhstan", "Germany", "Czech Republic", "South Korea", "China"],
  intended_major: "Компьютерные науки",
  budget_usd: 10000,
  needs_scholarship: true,
  gpa: 4.6,
  gpa_scale: 5,
  exams: [{ code: "IELTS", score: 6.5, status: "taken" }],
};

const NAMED = ["harvard", "stanford", "princeton", "yale", "duke", "dartmouth", "mit", "amherst"] as const;

function toUniversity(row: (typeof CATALOG_SNAPSHOT)[number]): FitUniversity {
  return {
    id: row.slug,
    slug: row.slug,
    name: row.name,
    country: row.country,
    city: null,
    region: null,
    majors: row.majors,
    requirements: null,
    deadlines: [],
    tuition_usd_per_year: coerceFinite(row.tuition_usd_per_year),
    aid_for_internationals: row.aid_for_internationals,
    scholarships: null,
    acceptance_rate: resolveAcceptanceRate(row.slug, row.acceptance_rate),
    source_url: `https://example.edu/${row.slug}`,
    ielts_min: coerceFinite(row.ielts_min),
    toefl_min: coerceFinite(row.toefl_min),
    duolingo_min: coerceFinite(row.duolingo_min),
    unt_min: coerceFinite(row.unt_min),
    sat_policy: row.sat_policy,
    sat_total_min: null,
    sat_total_max: null,
  };
}

describe("real catalog fit for the demo profile", () => {
  const fitted = CATALOG_SNAPSHOT.map((row) => ({
    slug: row.slug,
    category: fitUniversity(DEMO, toUniversity(row), TODAY).suggestedCategory,
  }));

  it("loads every catalog row and keeps safety from being the majority", () => {
    expect(CATALOG_SNAPSHOT).toHaveLength(35);
    const safety = fitted.filter((row) => row.category === "safety").length;
    expect(safety).toBeLessThan(fitted.length / 2);
  });

  it("marks every published admit rate at or under 15% as dream", () => {
    const selective = fitted.filter((row) => {
      const rate = resolveAcceptanceRate(
        row.slug,
        CATALOG_SNAPSHOT.find((item) => item.slug === row.slug)?.acceptance_rate,
      );
      const fraction = acceptanceFraction(rate);
      return fraction != null && fraction <= 0.15;
    });
    expect(selective.map((row) => row.slug).sort()).toEqual(
      Object.keys(CATALOG_ACCEPTANCE_RATE).sort(),
    );
    for (const row of selective) {
      expect(row.category, row.slug).toBe("dream");
    }
    for (const slug of NAMED) {
      expect(fitted.find((row) => row.slug === slug)?.category, slug).toBe("dream");
    }
  });
});
