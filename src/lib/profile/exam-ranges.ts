export const EXAM_CODES = [
  "IELTS",
  "TOEFL_IBT",
  "DET",
  "SAT",
  "ACT",
  "AP",
  "IB_DP",
  "A_LEVEL",
  "UNT",
  "NUET",
] as const;

export type ExamCode = (typeof EXAM_CODES)[number];

export const A_LEVEL_GRADES = ["A*", "A", "B", "C", "D", "E", "U"] as const;

export type ALevelGrade = (typeof A_LEVEL_GRADES)[number];

export const NUMERIC_EXAM_CODES = [
  "IELTS",
  "TOEFL_IBT",
  "DET",
  "SAT",
  "ACT",
  "AP",
  "IB_DP",
  "UNT",
  "NUET",
] as const;

export type NumericExamCode = (typeof NUMERIC_EXAM_CODES)[number];

/**
 * Official (or commonly published) score bounds used for client and server
 * validation. SAT/UNT bounds come from the product spec; the rest follow
 * the exams' published scales.
 *
 * TODO verify official NUET scale — 0–240 is accepted for now.
 */
export const EXAM_RANGES: Record<
  NumericExamCode,
  { min: number; max: number; step?: number }
> = {
  IELTS: { min: 0, max: 9, step: 0.5 },
  TOEFL_IBT: { min: 0, max: 120 },
  DET: { min: 10, max: 160 },
  SAT: { min: 400, max: 1600 },
  ACT: { min: 1, max: 36 },
  AP: { min: 1, max: 5 },
  IB_DP: { min: 0, max: 45 },
  UNT: { min: 0, max: 140 },
  NUET: { min: 0, max: 240 },
};

export const EXAMS_WITH_OPTIONAL_SUBJECT: ReadonlySet<ExamCode> = new Set([
  "AP",
  "A_LEVEL",
]);
