import { describe, expect, it } from "vitest";

import { computeProfileCompleteness } from "../profile/completeness";
import { emptyProfile, type ProfileData } from "../profile/types";

function filledProfile(): ProfileData {
  return {
    ...emptyProfile(),
    full_name: "Айгерим Сатпаева",
    path: "graduate",
    grade_or_year: "11 класс",
    city: "Алматы",
    intended_major: "Компьютерные науки",
    target_countries: ["Kazakhstan", "USA"],
    budget_usd: 0,
    needs_scholarship: true,
    english_level: "B2",
    exams: [
      {
        code: "UNT",
        score: 120,
        status: "planned",
        date: null,
      },
    ],
    gpa: 4.6,
    gpa_scale: 5,
    intake_year: 2027,
    onboarding_completed: true,
  };
}

describe("computeProfileCompleteness", () => {
  it("returns 0% for an empty profile", () => {
    const result = computeProfileCompleteness(emptyProfile());
    expect(result.percent).toBe(0);
    expect(result.missing.length).toBeGreaterThan(0);
    expect(result.firstMissing?.href).toMatch(/^\/onboarding/);
  });

  it("returns 100% for a fully filled profile", () => {
    const result = computeProfileCompleteness(filledProfile());
    expect(result.percent).toBe(100);
    expect(result.missing).toEqual([]);
    expect(result.firstMissing).toBeNull();
  });

  it("points at the first missing field on the profile page after onboarding", () => {
    const profile = filledProfile();
    profile.intended_major = null;
    profile.target_countries = [];
    const result = computeProfileCompleteness(profile);
    expect(result.percent).toBe(80);
    expect(result.firstMissing).toEqual({
      field: "intended_major",
      href: "/profile#intended_major",
    });
  });

  it("treats budget 0 as filled", () => {
    const profile = filledProfile();
    profile.budget_usd = 0;
    expect(computeProfileCompleteness(profile).percent).toBe(100);
  });
});
