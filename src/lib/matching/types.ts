export const FIT_CHECK_KEYS = [
  "english",
  "unt",
  "sat",
  "gpa",
  "budget",
  "major",
  "country",
  "deadline",
] as const;

export type FitCheckKey = (typeof FIT_CHECK_KEYS)[number];

/** Checks that affect the numeric score and the suggested category. */
export const SCORED_FIT_KEYS = [
  "english",
  "unt",
  "sat",
  "gpa",
  "budget",
  "major",
] as const;

export type ScoredFitKey = (typeof SCORED_FIT_KEYS)[number];

export type FitCheckStatus = "meets" | "below" | "unknown" | "not_required";

export type FitCategory = "dream" | "target" | "safety";

export type FitCheck = {
  key: FitCheckKey;
  status: FitCheckStatus;
  have: string | null;
  need: string | null;
  sourceUrl: string | null;
};

export type FitGap = {
  key: FitCheckKey;
  message_ru: string;
  delta: string | null;
};

export type FitResult = {
  /** Mean of known scored checks. Null when nothing is comparable. Not an admission probability. */
  score: number | null;
  suggestedCategory: FitCategory | null;
  checks: FitCheck[];
  gaps: FitGap[];
};

export type FitExam = {
  code: string;
  score: number | string;
  status: "taken" | "planned";
};

export type FitProfile = {
  target_countries: string[];
  intended_major: string | null;
  budget_usd: number | null;
  needs_scholarship: boolean;
  gpa: number | null;
  gpa_scale: number | null;
  exams: FitExam[];
};

export type FitUniversity = {
  id: string;
  slug: string;
  name: string;
  country: string;
  city: string | null;
  region: string | null;
  majors: string[] | null;
  requirements: Record<string, unknown> | null;
  deadlines: { round: string; date: string; note: string | null }[];
  tuition_usd_per_year: number | null;
  aid_for_internationals: string | null;
  scholarships: string | null;
  acceptance_rate: number | null;
  source_url: string;
  ielts_min: number | null;
  toefl_min: number | null;
  duolingo_min: number | null;
  unt_min: number | null;
  sat_policy: string | null;
  sat_total_min: number | null;
  sat_total_max: number | null;
  /** Middle 50% range such as "1510-1580". The low number is a floor when sat_total_min is empty. */
  sat_middle_50?: string | null;
};

export type UniversityFilters = {
  region?: string | null;
  country?: string | null;
  major?: string | null;
  maxTuition?: number | null;
  freeOrGrantOnly?: boolean;
  satPolicy?: string | null;
  query?: string | null;
};
