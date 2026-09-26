import { describe, expect, it } from "vitest";

import { statusAfterSkippedSave } from "../hooks/use-autosave";
import { canonicalizePreset, resolveOtherValue } from "../profile/presets";
import { profileFormSchema } from "../profile/schemas";
import { KZ_CITIES, MAJOR_OPTIONS } from "../profile/types";
import { strings } from "../strings";

const baseProfile = {
  full_name: "Айгерим",
  path: "graduate" as const,
  grade_or_year: "11 класс",
  city: "Алматы",
  intended_major: "Компьютерные науки",
  target_countries: [] as string[],
  budget_usd: null,
  needs_scholarship: false,
  english_level: "B2" as const,
  exams: [],
  gpa: null,
  gpa_scale: null,
  intake_year: 2027,
};

describe("profile other flags", () => {
  it("blocks an empty Другой major", () => {
    const result = profileFormSchema.safeParse({
      ...baseProfile,
      intended_major: null,
      major_is_other: true,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.message)).toContain(
        strings.profile.errors.majorOtherRequired,
      );
    }
  });

  it("blocks an empty Другой city", () => {
    const result = profileFormSchema.safeParse({
      ...baseProfile,
      city: "   ",
      city_is_other: true,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.message)).toContain(
        strings.profile.errors.cityOtherRequired,
      );
    }
  });
});

describe("canonicalizePreset", () => {
  it("maps a case-insensitive preset back to the catalog value", () => {
    expect(canonicalizePreset("  актау ", KZ_CITIES)).toBe("Актау");
    expect(canonicalizePreset("Кокшетау", KZ_CITIES)).toBe("Кокшетау");
  });

  it("clears the other flag when the typed text is a preset", () => {
    expect(resolveOtherValue("Актау", KZ_CITIES, true)).toEqual({
      value: "Актау",
      isOther: false,
    });
    expect(resolveOtherValue("биоинформатика", MAJOR_OPTIONS, true).isOther).toBe(
      true,
    );
  });
});

describe("statusAfterSkippedSave", () => {
  it("does not stay on saving when a flush has nothing to write", () => {
    expect(statusAfterSkippedSave(false)).toBe("idle");
    expect(statusAfterSkippedSave(true)).toBe("saved");
    expect(statusAfterSkippedSave(false)).not.toBe("saving");
  });
});
