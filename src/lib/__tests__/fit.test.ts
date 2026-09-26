import { describe, expect, it } from "vitest";

import { checkByKey, fitUniversity, rankUniversities } from "@/lib/matching/fit";
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

describe("fitUniversity", () => {
  it("marks known checks meets and leaves missing university data unknown", () => {
    const result = fitUniversity(profile(), university(), TODAY);
    expect(checkByKey(result, "english").status).toBe("meets");
    expect(checkByKey(result, "gpa").status).toBe("meets");
    expect(checkByKey(result, "budget").status).toBe("meets");
    expect(checkByKey(result, "major").status).toBe("meets");
    expect(checkByKey(result, "unt").status).toBe("unknown");
    expect(checkByKey(result, "sat").status).toBe("not_required");
    expect(checkByKey(result, "country").need).toBe("США");
    expect(checkByKey(result, "country").have).toBe("США");
    expect(result.score).toBe(100);
    expect(result.suggestedCategory).toBe("safety");
  });

  it("marks a score below the published minimum as below", () => {
    const result = fitUniversity(
      profile({ exams: [{ code: "IELTS", score: 6, status: "taken" }] }),
      university(),
      TODAY,
    );
    expect(checkByKey(result, "english").status).toBe("below");
    expect(result.suggestedCategory).toBe("dream");
    expect(result.gaps.some((gap) => gap.key === "english" && gap.delta)).toBe(true);
  });

  it("marks english below when any taken test is under the requirement", () => {
    const result = fitUniversity(
      profile({ exams: [{ code: "IELTS", score: 6.5, status: "taken" }] }),
      university({ ielts_min: 7, toefl_min: 100 }),
      TODAY,
    );
    expect(checkByKey(result, "english").status).toBe("below");
    expect(result.gaps).toContainEqual({
      key: "english",
      message_ru: "поднять IELTS до 7.0",
      delta: "поднять IELTS до 7.0",
    });
  });

  it("matches a Russian specialty to English program names", () => {
    const result = fitUniversity(
      profile({ intended_major: "Компьютерные науки" }),
      university({ majors: ["BSc Computer Science", "Economics"] }),
      TODAY,
    );
    expect(checkByKey(result, "major").status).toBe("meets");
  });

  it("treats a missing program list as unknown, not failed", () => {
    const result = fitUniversity(
      profile({ intended_major: "Компьютерные науки" }),
      university({ majors: [] }),
      TODAY,
    );
    expect(checkByKey(result, "major").status).toBe("unknown");
    expect(result.suggestedCategory).not.toBe("dream");
  });

  it("asks for a missing profile score instead of penalizing it", () => {
    const result = fitUniversity(profile({ exams: [] }), university(), TODAY);
    expect(checkByKey(result, "english").status).toBe("unknown");
    expect(result.gaps).toContainEqual({
      key: "english",
      message_ru: "добавьте результат IELTS, TOEFL или Duolingo",
      delta: null,
    });
    expect(result.score).toBe(100);
    expect(result.suggestedCategory).toBe("target");
  });

  it("does not parse a text gpa note into a threshold", () => {
    const result = fitUniversity(
      profile({ gpa: null, gpa_scale: null }),
      university({ requirements: { gpa_note: "around 3.7" } }),
      TODAY,
    );
    expect(checkByKey(result, "gpa").status).toBe("unknown");
    expect(result.gaps.some((gap) => gap.key === "gpa")).toBe(false);
  });

  it("treats scholarship aid as meeting an over-budget tuition", () => {
    const expensive = university({ tuition_usd_per_year: 60000, aid_for_internationals: "merit" });
    const withoutAid = fitUniversity(
      profile({ budget_usd: 10000, needs_scholarship: false }),
      expensive,
      TODAY,
    );
    const withAid = fitUniversity(
      profile({ budget_usd: 10000, needs_scholarship: true }),
      expensive,
      TODAY,
    );
    const unknownAid = fitUniversity(
      profile({ budget_usd: 10000, needs_scholarship: true }),
      university({ tuition_usd_per_year: 60000, aid_for_internationals: "unknown" }),
      TODAY,
    );
    expect(checkByKey(withoutAid, "budget").status).toBe("below");
    expect(checkByKey(withAid, "budget").status).toBe("meets");
    expect(checkByKey(unknownAid, "budget").status).toBe("unknown");
  });

  it("asks for a budget when tuition is known and the profile has none", () => {
    const result = fitUniversity(profile({ budget_usd: null }), university(), TODAY);
    expect(checkByKey(result, "budget").status).toBe("unknown");
    expect(result.gaps).toContainEqual({
      key: "budget",
      message_ru: "добавьте бюджет",
      delta: null,
    });
  });

  it("keeps a last-cycle past deadline unknown and out of the score", () => {
    const base = fitUniversity(profile(), university({ deadlines: [] }), TODAY);
    const stale = fitUniversity(profile(), university(), TODAY);
    expect(checkByKey(stale, "deadline").status).toBe("unknown");
    expect(checkByKey(stale, "deadline").need).toBe(
      "по прошлому циклу — проверьте на сайте вуза",
    );
    expect(stale.score).toBe(base.score);
    expect(stale.suggestedCategory).toBe(base.suggestedCategory);
  });

  it("shows country but does not let it change the score or category", () => {
    const matched = fitUniversity(profile(), university(), TODAY);
    const otherCountry = fitUniversity(
      profile({ target_countries: ["Kazakhstan"] }),
      university(),
      TODAY,
    );
    expect(checkByKey(otherCountry, "country").status).toBe("below");
    expect(otherCountry.score).toBe(matched.score);
    expect(otherCountry.suggestedCategory).toBe(matched.suggestedCategory);
  });

  it("treats optional SAT with no score as not required", () => {
    const result = fitUniversity(profile(), university({ sat_policy: "optional" }), TODAY);
    expect(checkByKey(result, "sat").status).toBe("not_required");
    expect(result.gaps.some((gap) => gap.key === "sat")).toBe(false);
  });

  it("compares a required SAT and pushes a selective school to dream", () => {
    const lowSat = fitUniversity(
      profile({ exams: [{ code: "SAT", score: 1200, status: "taken" }, { code: "IELTS", score: 7, status: "taken" }] }),
      university({ sat_policy: "required", sat_total_min: 1450, acceptance_rate: 0.5 }),
      TODAY,
    );
    expect(checkByKey(lowSat, "sat").status).toBe("below");
    expect(lowSat.suggestedCategory).toBe("dream");

    const selective = fitUniversity(
      profile(),
      university({ acceptance_rate: 0.08 }),
      TODAY,
    );
    expect(selective.score).toBe(100);
    expect(selective.suggestedCategory).toBe("dream");
  });

  it("returns a null score when nothing is comparable", () => {
    const result = fitUniversity(
      profile({
        exams: [],
        gpa: null,
        gpa_scale: null,
        budget_usd: null,
        intended_major: null,
      }),
      university({
        ielts_min: null,
        requirements: null,
        tuition_usd_per_year: null,
        majors: [],
        sat_policy: null,
        acceptance_rate: null,
      }),
      TODAY,
    );
    expect(result.score).toBeNull();
    expect(result.suggestedCategory).toBeNull();
  });
});

describe("rankUniversities", () => {
  it("filters and sorts null scores last", () => {
    const open = university({ id: "open", name: "Open", slug: "open", acceptance_rate: 0.5 });
    const hidden = university({
      id: "kz",
      name: "Kazakh Uni",
      slug: "kz",
      region: "kazakhstan",
      country: "Kazakhstan",
    });
    const ranked = rankUniversities(profile(), [hidden, open], { region: "usa" }, TODAY);
    expect(ranked.map((item) => item.id)).toEqual(["open"]);
  });

  it("keeps only free or grant universities when asked", () => {
    const free = university({
      id: "free",
      name: "Free Uni",
      slug: "free",
      tuition_usd_per_year: 0,
    });
    const paid = university({
      id: "paid",
      name: "Paid Uni",
      slug: "paid",
      tuition_usd_per_year: 40000,
      aid_for_internationals: "none",
    });
    const ranked = rankUniversities(profile(), [paid, free], { freeOrGrantOnly: true }, TODAY);
    expect(ranked.map((item) => item.id)).toEqual(["free"]);
  });
});
