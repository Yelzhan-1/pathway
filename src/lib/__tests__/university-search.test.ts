import { describe, expect, it } from "vitest";

import { rankUniversities } from "@/lib/matching/fit";
import { universityMatchesQuery } from "@/lib/matching/synonyms";
import type { FitProfile, FitUniversity } from "@/lib/matching/types";
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

describe("universityMatchesQuery", () => {
  const cambridge: Pick<FitUniversity, "name" | "city" | "country" | "slug" | "majors"> = {
    name: "University of Cambridge",
    city: "Cambridge",
    country: "UK",
    slug: "cambridge",
    majors: ["Computer Science", "Economics"],
  };
  const nu: typeof cambridge = {
    name: "Nazarbayev University",
    city: "Astana",
    country: "Kazakhstan",
    slug: "nazarbayev-university",
    majors: ["Computer Science"],
  };
  const kbtu: typeof cambridge = {
    name: "KBTU",
    city: "Almaty",
    country: "Kazakhstan",
    slug: "kbtu",
    majors: ["Information Systems"],
  };

  it("matches RU and EN names, city, country, and program synonyms", () => {
    expect(universityMatchesQuery(kbtu, "Алматы")).toBe(true);
    expect(universityMatchesQuery(nu, "Назарбаев")).toBe(true);
    expect(universityMatchesQuery(cambridge, "Кембридж")).toBe(true);
    expect(universityMatchesQuery(cambridge, "информатика")).toBe(true);
    expect(universityMatchesQuery(cambridge, "Computer Science")).toBe(true);
  });
});

describe("rankUniversities search", () => {
  it("returns Cambridge for a Russian name query", () => {
    const profile: FitProfile = {
      target_countries: [],
      intended_major: null,
      budget_usd: null,
      needs_scholarship: false,
      gpa: null,
      gpa_scale: null,
      exams: [],
    };
    const uni: FitUniversity = {
      id: "cam",
      slug: "cambridge",
      name: "University of Cambridge",
      country: "UK",
      city: "Cambridge",
      region: "uk",
      majors: ["Computer Science"],
      requirements: null,
      deadlines: [],
      tuition_usd_per_year: null,
      aid_for_internationals: null,
      scholarships: null,
      acceptance_rate: null,
      source_url: "https://cam.ac.uk",
      ielts_min: null,
      toefl_min: null,
      duolingo_min: null,
      unt_min: null,
      sat_policy: null,
      sat_total_min: null,
      sat_total_max: null,
    };
    const ranked = rankUniversities(profile, [uni], { query: "Кембридж" }, "2026-09-26");
    expect(ranked.map((item) => item.slug)).toEqual(["cambridge"]);
  });
});
