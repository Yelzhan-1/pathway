import type { ProfileData } from "./types";

export const TOTAL_ONBOARDING_STEPS = 10;
export const ONBOARDING_STEP_MAX = 20;

export const ONBOARDING_STEP_KEYS = [
  "status",
  "city",
  "major",
  "countries",
  "budget",
  "english",
  "exams",
  "gpa",
  "intakeYear",
  "summary",
] as const;

export type OnboardingStepKey = (typeof ONBOARDING_STEP_KEYS)[number];

export const REQUIRED_ONBOARDING_STEPS: ReadonlySet<OnboardingStepKey> =
  new Set(["status", "city", "english", "intakeYear", "summary"]);

export function isSkippableOnboardingStep(step: number): boolean {
  const key = ONBOARDING_STEP_KEYS[step - 1];
  if (!key) return false;
  return !REQUIRED_ONBOARDING_STEPS.has(key);
}

/**
 * After saving or skipping `completedStep` (1-based), persist
 * max(current, completedStep + 1), clamped to the DB check (0–20).
 */
export function nextOnboardingCursor(
  current: number,
  completedStep: number,
): number {
  const safeCurrent = Number.isFinite(current) ? current : 0;
  return Math.max(
    0,
    Math.min(ONBOARDING_STEP_MAX, Math.max(safeCurrent, completedStep + 1)),
  );
}

/**
 * Resume at the first unanswered step. `onboarding_step` is the 1-based
 * next step to show (0 means "start at step 1").
 */
export function getFirstUnansweredStep(profile: {
  onboarding_step: number;
  onboarding_completed: boolean;
}): number {
  if (profile.onboarding_completed) return TOTAL_ONBOARDING_STEPS;
  const cursor = Number.isFinite(profile.onboarding_step)
    ? profile.onboarding_step
    : 0;
  if (cursor <= 0) return 1;
  return Math.min(TOTAL_ONBOARDING_STEPS, Math.max(1, Math.trunc(cursor)));
}

export function resolveRequestedStep(
  profile: { onboarding_step: number; onboarding_completed: boolean },
  rawStep: string | string[] | undefined,
): number {
  const firstUnanswered = getFirstUnansweredStep(profile);
  const raw = Array.isArray(rawStep) ? rawStep[0] : rawStep;
  if (!raw) return firstUnanswered;
  const requested = Number.parseInt(raw, 10);
  if (!Number.isFinite(requested)) return firstUnanswered;
  if (requested < 1) return 1;
  if (requested > firstUnanswered) return firstUnanswered;
  return requested;
}

/**
 * Where to send the user after saving/skipping `completedStep`.
 * Linear progress goes to the next step; editing from the summary
 * (cursor already at 10) returns to the summary.
 */
export function destinationAfterStep(
  currentCursor: number,
  completedStep: number,
): number {
  return Math.min(
    TOTAL_ONBOARDING_STEPS,
    nextOnboardingCursor(currentCursor, completedStep),
  );
}

export function canCompleteOnboarding(
  profile: Pick<
    ProfileData,
    "path" | "grade_or_year" | "city" | "english_level" | "intake_year"
  >,
): boolean {
  return Boolean(
    profile.path &&
      profile.grade_or_year &&
      profile.city &&
      profile.english_level &&
      profile.intake_year,
  );
}
