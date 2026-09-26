import { describe, expect, it } from "vitest";

import { computeProfileCompleteness } from "../completeness";
import { profileSectionProgress } from "../sections";
import { emptyProfile } from "../types";

describe("profileSectionProgress", () => {
  it("shows 0% for every section on an empty profile", () => {
    const completeness = computeProfileCompleteness(emptyProfile());
    const sections = profileSectionProgress(completeness);
    expect(sections).toHaveLength(5);
    expect(sections.every((section) => section.percent === 0 && !section.done)).toBe(true);
  });

  it("marks a section done once all its fields are filled", () => {
    const profile = { ...emptyProfile(), budget_usd: 20000 };
    const completeness = computeProfileCompleteness(profile);
    const sections = profileSectionProgress(completeness);
    const budget = sections.find((section) => section.id === "budget");
    expect(budget).toMatchObject({ percent: 100, done: true, href: "/profile#budget" });
  });

  it("gives partial credit when only some fields in a section are filled", () => {
    const profile = { ...emptyProfile(), full_name: "Аружан" };
    const completeness = computeProfileCompleteness(profile);
    const sections = profileSectionProgress(completeness);
    const basics = sections.find((section) => section.id === "basics");
    expect(basics?.percent).toBeGreaterThan(0);
    expect(basics?.percent).toBeLessThan(100);
    expect(basics?.done).toBe(false);
  });
});
