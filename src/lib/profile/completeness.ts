import type { ProfileData } from "./types";

/**
 * Weighted completeness of the applicant profile (onboarding/profile
 * fields only — CV and activities are excluded).
 *
 * Weights (total 100):
 * - full_name            5
 * - path                 8
 * - grade_or_year        7
 * - city                10
 * - intended_major      10
 * - target_countries    10
 * - budget              10  (budget_usd != null, including 0)
 * - english_level       10
 * - exams               10  (at least one exam entry)
 * - gpa                 10  (gpa and gpa_scale both set)
 * - intake_year         10
 */
export const PROFILE_COMPLETENESS_WEIGHTS = {
  full_name: 5,
  path: 8,
  grade_or_year: 7,
  city: 10,
  intended_major: 10,
  target_countries: 10,
  budget: 10,
  english_level: 10,
  exams: 10,
  gpa: 10,
  intake_year: 10,
} as const;

export type CompletenessField = keyof typeof PROFILE_COMPLETENESS_WEIGHTS;

export type MissingProfileField = {
  field: CompletenessField;
  href: string;
};

export type ProfileCompleteness = {
  percent: number;
  earned: number;
  total: number;
  missing: MissingProfileField[];
  firstMissing: MissingProfileField | null;
};

const FIELD_HREFS: Record<CompletenessField, string> = {
  full_name: "/profile#basics",
  path: "/profile#basics",
  grade_or_year: "/profile#basics",
  city: "/profile#basics",
  intended_major: "/profile#goals",
  target_countries: "/profile#goals",
  budget: "/profile#budget",
  english_level: "/profile#english",
  exams: "/profile#english",
  gpa: "/profile#academics",
  intake_year: "/profile#basics",
};

const ONBOARDING_HREFS: Record<CompletenessField, string> = {
  full_name: "/onboarding?step=1",
  path: "/onboarding?step=1",
  grade_or_year: "/onboarding?step=1",
  city: "/onboarding?step=2",
  intended_major: "/onboarding?step=3",
  target_countries: "/onboarding?step=4",
  budget: "/onboarding?step=5",
  english_level: "/onboarding?step=6",
  exams: "/onboarding?step=7",
  gpa: "/onboarding?step=8",
  intake_year: "/onboarding?step=9",
};

function isFilled(field: CompletenessField, profile: ProfileData): boolean {
  switch (field) {
    case "full_name":
      return Boolean(profile.full_name?.trim());
    case "path":
      return profile.path === "graduate" || profile.path === "transfer";
    case "grade_or_year":
      return Boolean(profile.grade_or_year?.trim());
    case "city":
      return Boolean(profile.city?.trim());
    case "intended_major":
      return Boolean(profile.intended_major?.trim());
    case "target_countries":
      return profile.target_countries.length > 0;
    case "budget":
      return profile.budget_usd != null;
    case "english_level":
      return Boolean(profile.english_level);
    case "exams":
      return profile.exams.length > 0;
    case "gpa":
      return profile.gpa != null && profile.gpa_scale != null;
    case "intake_year":
      return profile.intake_year != null;
  }
}

export function computeProfileCompleteness(
  profile: ProfileData,
): ProfileCompleteness {
  const missing: MissingProfileField[] = [];
  let earned = 0;
  let total = 0;

  const hrefs = profile.onboarding_completed ? FIELD_HREFS : ONBOARDING_HREFS;

  for (const field of Object.keys(
    PROFILE_COMPLETENESS_WEIGHTS,
  ) as CompletenessField[]) {
    const weight = PROFILE_COMPLETENESS_WEIGHTS[field];
    total += weight;
    if (isFilled(field, profile)) {
      earned += weight;
    } else {
      missing.push({ field, href: hrefs[field] });
    }
  }

  const percent = total === 0 ? 0 : Math.round((earned / total) * 100);

  return {
    percent,
    earned,
    total,
    missing,
    firstMissing: missing[0] ?? null,
  };
}
