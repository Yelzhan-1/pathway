import type { FitProfile } from "./types";

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
