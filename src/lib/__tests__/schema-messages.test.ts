import { describe, expect, it } from "vitest";

import { cvLinkSchema, intakeYearStepSchema, profileFormSchema } from "../profile/schemas";
import { intakeYearOptions } from "../profile/types";
import { strings } from "../strings";

describe("Russian schema messages", () => {
  it("rejects a null string with a Russian invalid_type message", () => {
    const result = profileFormSchema.safeParse({
      full_name: null,
      path: "graduate",
      grade_or_year: "11 класс",
      city: "Алматы",
      intended_major: null,
      target_countries: [],
      budget_usd: null,
      needs_scholarship: false,
      english_level: "B2",
      exams: [],
      gpa: null,
      gpa_scale: null,
      intake_year: 2027,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        strings.auth.errors.fullNameRequired,
      );
      expect(result.error.issues[0]?.message).not.toMatch(/expected string/i);
    }
  });

  it("rejects an intake year above 2035 in Russian", () => {
    const result = intakeYearStepSchema.safeParse({ intake_year: 2036 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        strings.profile.errors.intakeYearRange,
      );
      expect(result.error.issues[0]?.message).not.toMatch(/Too big/i);
    }
  });

  it("requires english_level and intake_year on the profile form", () => {
    const result = profileFormSchema.safeParse({
      full_name: "Айгерим",
      path: "graduate",
      grade_or_year: "11 класс",
      city: "Алматы",
      intended_major: null,
      target_countries: [],
      budget_usd: null,
      needs_scholarship: false,
      english_level: null,
      exams: [],
      gpa: null,
      gpa_scale: null,
      intake_year: null,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((issue) => issue.message);
      expect(messages).toContain(strings.profile.errors.englishRequired);
      expect(messages).toContain(strings.profile.errors.intakeYearRange);
    }
  });
});

describe("intakeYearOptions", () => {
  it("never starts before 2026 and spans at most 10 years", () => {
    expect(intakeYearOptions(new Date("2024-01-01T00:00:00Z"))[0]).toBe(2026);
    const from2026 = intakeYearOptions(new Date("2026-09-26T00:00:00Z"));
    expect(from2026[0]).toBe(2026);
    expect(from2026.at(-1)).toBe(2035);
    expect(from2026).toHaveLength(10);
  });

  it("rejects years before 2026 in the schema", () => {
    expect(intakeYearStepSchema.safeParse({ intake_year: 2025 }).success).toBe(
      false,
    );
    expect(intakeYearStepSchema.safeParse({ intake_year: 2026 }).success).toBe(
      true,
    );
  });
});

describe("cvLinkSchema", () => {
  it("allows empty or http(s) URLs and rejects others", () => {
    expect(cvLinkSchema.safeParse({ label: "x", url: "" }).success).toBe(true);
    expect(
      cvLinkSchema.safeParse({ label: "x", url: "https://example.com" }).success,
    ).toBe(true);
    expect(
      cvLinkSchema.safeParse({ label: "x", url: "javascript:alert(1)" }).success,
    ).toBe(false);
    expect(
      cvLinkSchema.safeParse({ label: "x", url: `https://x.com/${"a".repeat(200)}` })
        .success,
    ).toBe(false);
  });
});
