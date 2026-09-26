import type { FitCategory, FitProfile } from "./types";
import { strings } from "@/lib/strings";

export const SLIDER_EXAMS = ["IELTS", "TOEFL_IBT", "DET", "SAT", "UNT"] as const;

export type SliderExam = (typeof SLIDER_EXAMS)[number];

/** Profile the what-if sliders describe. Saved exams for those codes are replaced, not merged. */
export function hypotheticalProfile(
  profile: FitProfile,
  input: { gpa: number | null; scores: Record<string, number | null> },
): FitProfile {
  const exams = profile.exams.filter(
    (exam) =>
      exam.status !== "taken" || !SLIDER_EXAMS.includes(exam.code as SliderExam),
  );
  for (const code of SLIDER_EXAMS) {
    const value = input.scores[code];
    if (value == null || !Number.isFinite(value)) continue;
    exams.push({ code, score: value, status: "taken" });
  }
  return { ...profile, gpa: input.gpa, exams };
}

function categoryRank(category: FitCategory | null): number {
  if (category === "dream") return 0;
  if (category === "target") return 1;
  if (category === "safety") return 2;
  return -1;
}

/** The status line. The unchanged sentence appears only when every category and grant stays put. */
export function whatIfSummary(
  rows: { before: FitCategory | null; after: FitCategory | null; grantUnlocked: boolean }[],
): string {
  const changed = rows.filter((row) => row.before !== row.after);
  const improved = changed.filter((row) => categoryRank(row.after) > categoryRank(row.before)).length;
  const dropped = changed.filter((row) => categoryRank(row.after) < categoryRank(row.before)).length;
  const grants = rows.filter((row) => row.grantUnlocked).length;
  if (changed.length === 0 && grants === 0) return strings.whatIf.none;
  return [
    improved > 0 ? strings.whatIf.improved(improved) : null,
    dropped > 0 ? strings.whatIf.dropped(dropped) : null,
    grants > 0 ? strings.whatIf.grants(grants) : null,
  ]
    .filter((part): part is string => part != null)
    .join(". ");
}
