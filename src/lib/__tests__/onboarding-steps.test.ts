import { describe, expect, it } from "vitest";

import {
  canCompleteOnboarding,
  destinationAfterStep,
  getFirstUnansweredStep,
  nextOnboardingCursor,
  resolveRequestedStep,
} from "../profile/onboarding-steps";
import { emptyProfile } from "../profile/types";

describe("getFirstUnansweredStep", () => {
  it("starts at step 1 when the cursor is 0", () => {
    expect(
      getFirstUnansweredStep({
        onboarding_step: 0,
        onboarding_completed: false,
      }),
    ).toBe(1);
  });

  it("resumes at the stored cursor", () => {
    expect(
      getFirstUnansweredStep({
        onboarding_step: 4,
        onboarding_completed: false,
      }),
    ).toBe(4);
  });

  it("clamps a cursor past the last step to the summary", () => {
    expect(
      getFirstUnansweredStep({
        onboarding_step: 20,
        onboarding_completed: false,
      }),
    ).toBe(10);
  });

  it("returns the summary when onboarding is already complete", () => {
    expect(
      getFirstUnansweredStep({
        onboarding_step: 2,
        onboarding_completed: true,
      }),
    ).toBe(10);
  });
});

describe("nextOnboardingCursor", () => {
  it("bumps to max(current, step + 1)", () => {
    expect(nextOnboardingCursor(0, 1)).toBe(2);
    expect(nextOnboardingCursor(5, 3)).toBe(5);
    expect(nextOnboardingCursor(9, 9)).toBe(10);
  });

  it("clamps to the database maximum of 20", () => {
    expect(nextOnboardingCursor(20, 20)).toBe(20);
  });
});

describe("resolveRequestedStep", () => {
  const profile = { onboarding_step: 5, onboarding_completed: false };

  it("allows going back to an earlier step", () => {
    expect(resolveRequestedStep(profile, "2")).toBe(2);
  });

  it("does not allow skipping ahead of the cursor", () => {
    expect(resolveRequestedStep(profile, "9")).toBe(5);
  });

  it("falls back for invalid values", () => {
    expect(resolveRequestedStep(profile, "foo")).toBe(5);
    expect(resolveRequestedStep(profile, undefined)).toBe(5);
  });
});

describe("destinationAfterStep", () => {
  it("advances linearly and returns to the summary when editing later", () => {
    expect(destinationAfterStep(0, 1)).toBe(2);
    expect(destinationAfterStep(9, 9)).toBe(10);
    expect(destinationAfterStep(10, 3)).toBe(10);
  });
});

describe("canCompleteOnboarding", () => {
  it("requires the four required fields", () => {
    expect(canCompleteOnboarding(emptyProfile())).toBe(false);
    expect(
      canCompleteOnboarding({
        path: "graduate",
        grade_or_year: "11 класс",
        city: "Алматы",
        english_level: "none",
        intake_year: 2027,
      }),
    ).toBe(true);
  });
});
