import { examLabel } from "@/lib/labels/display";
import { universityGpaMinRatio } from "@/lib/matching/gpa";
import { fitUniversity } from "@/lib/matching/fit";
import type { FitCategory, FitProfile, FitUniversity } from "@/lib/matching/types";
import { EXAM_RANGES } from "@/lib/profile/exam-ranges";

/**
 * Prep-week estimates when the exam plan has no calendar (no upcoming deadline).
 * - IELTS: 4 weeks per 0.5 band
 * - TOEFL iBT: 3 weeks per 5 points
 * - Duolingo: 2 weeks per 10 points
 * - SAT: 2 weeks per 50 points
 * - ЕНТ: 2 weeks per 5 points
 * - GPA: 6 weeks per 0.1 on the profile scale
 * - First sit of a required exam at the published minimum: 6 weeks (registration included)
 * - First GPA on file at the published minimum: 8 weeks
 */
export const PREP_WEEK_TABLE_RU =
  "IELTS: 4 нед. / 0.5 балла; TOEFL: 3 нед. / 5 баллов; SAT: 2 нед. / 50 баллов; GPA: 6 нед. / 0.1; первый экзамен: 6 нед.";

export type PathLever = {
  id: string;
  examCode: string | null;
  from: number | null;
  to: number;
  weeks: number;
  label_ru: string;
};

export type PathCombo = {
  levers: PathLever[];
  weeks: number;
  category: FitCategory;
  score: number | null;
};

export type ShortestPathResult = {
  from: FitCategory | null;
  goal: FitCategory | null;
  combos: PathCombo[];
  reason_ru: string | null;
};

const TODAY = "2026-09-26";

function takenScore(profile: FitProfile, code: string): number | null {
  const scores = profile.exams
    .filter(
      (exam) =>
        exam.code === code &&
        exam.status === "taken" &&
        typeof exam.score === "number" &&
        Number.isFinite(exam.score),
    )
    .map((exam) => exam.score as number);
  if (scores.length === 0) return null;
  return Math.max(...scores);
}

function rank(category: FitCategory | null): number {
  if (category === "dream") return 0;
  if (category === "target") return 1;
  if (category === "safety") return 2;
  return -1;
}

function goalFrom(current: FitCategory | null): FitCategory | null {
  if (current === "safety") return null;
  if (current === "target") return "safety";
  return "target";
}

function ceilToStep(value: number, step: number): number {
  return Math.round(Math.ceil(value / step - 1e-9) * step * 1000) / 1000;
}

function examWeeks(code: string, from: number | null, to: number): number {
  if (from == null) return 6;
  const delta = Math.max(0, to - from);
  if (delta === 0) return 1;
  if (code === "IELTS") return Math.max(1, Math.ceil(delta / 0.5) * 4);
  if (code === "TOEFL_IBT") return Math.max(1, Math.ceil(delta / 5) * 3);
  if (code === "DET") return Math.max(1, Math.ceil(delta / 10) * 2);
  if (code === "SAT") return Math.max(1, Math.ceil(delta / 50) * 2);
  if (code === "UNT") return Math.max(1, Math.ceil(delta / 5) * 2);
  return Math.max(1, Math.ceil(delta));
}

function withinCap(code: string, value: number): boolean {
  const range = EXAM_RANGES[code as keyof typeof EXAM_RANGES];
  if (!range) return value <= 1600;
  return value <= range.max + 1e-9;
}

function examLever(
  code: string,
  from: number | null,
  to: number,
  kind: "raise" | "take",
): PathLever | null {
  const step = code === "IELTS" ? 0.5 : code === "SAT" ? 50 : code === "TOEFL_IBT" ? 5 : 1;
  const target = ceilToStep(to, step);
  if (from != null && from + 1e-9 >= target) return null;
  if (!withinCap(code, target)) return null;
  const name = examLabel(code);
  return {
    id: `${kind}:${code}`,
    examCode: code,
    from,
    to: target,
    weeks: examWeeks(code, from, target),
    label_ru:
      kind === "take"
        ? `сдать ${name} на ${target}`
        : `поднять ${name} до ${target}`,
  };
}

function collectLevers(profile: FitProfile, university: FitUniversity): PathLever[] {
  const levers: PathLever[] = [];
  const english = [
    { code: "IELTS", min: university.ielts_min },
    { code: "TOEFL_IBT", min: university.toefl_min },
    { code: "DET", min: university.duolingo_min },
  ] as const;
  const anyEnglishMin = english.some((item) => item.min != null);
  if (anyEnglishMin) {
    const passing = english.some((item) => {
      if (item.min == null) return false;
      const score = takenScore(profile, item.code);
      return score != null && score + 1e-9 >= item.min;
    });
    if (!passing) {
      for (const item of english) {
        if (item.min == null) continue;
        const score = takenScore(profile, item.code);
        const lever = examLever(item.code, score, item.min, score == null ? "take" : "raise");
        if (lever) levers.push(lever);
      }
    }
  }

  if (university.unt_min != null) {
    const score = takenScore(profile, "UNT");
    const lever = examLever("UNT", score, university.unt_min, score == null ? "take" : "raise");
    if (lever) levers.push(lever);
  }

  if (university.sat_policy === "required" && university.sat_total_min != null) {
    const score = takenScore(profile, "SAT");
    const lever = examLever("SAT", score, university.sat_total_min, score == null ? "take" : "raise");
    if (lever) levers.push(lever);
  } else if (university.sat_policy === "optional" && university.sat_total_min != null) {
    const score = takenScore(profile, "SAT");
    if (score != null) {
      const lever = examLever("SAT", score, university.sat_total_min, "raise");
      if (lever) levers.push(lever);
    }
  }

  const minRatio = universityGpaMinRatio(university.requirements);
  if (minRatio != null && profile.gpa_scale != null) {
    const need = ceilToStep(minRatio * profile.gpa_scale, 0.1);
    const cap = profile.gpa_scale;
    if (need <= cap + 1e-9) {
      const have = profile.gpa;
      if (have == null || have + 1e-9 < need) {
        const delta = need - (have ?? 0);
        levers.push({
          id: "gpa",
          examCode: null,
          from: have,
          to: need,
          weeks: have == null ? 8 : Math.max(1, Math.ceil(delta / 0.1) * 6),
          label_ru: `поднять GPA до ${need}`,
        });
      }
    }
  }

  return levers;
}

function applyLevers(profile: FitProfile, levers: PathLever[]): FitProfile {
  let next: FitProfile = {
    ...profile,
    exams: profile.exams.map((exam) => ({ ...exam })),
  };
  for (const lever of levers) {
    if (lever.id === "gpa") {
      next = { ...next, gpa: lever.to };
      continue;
    }
    if (!lever.examCode) continue;
    const exams = next.exams.filter(
      (exam) => !(exam.code === lever.examCode && exam.status === "taken"),
    );
    next = {
      ...next,
      exams: [...exams, { code: lever.examCode, score: lever.to, status: "taken" }],
    };
  }
  return next;
}

function subset<T>(items: T[], mask: number): T[] {
  return items.filter((_, index) => (mask & (1 << index)) !== 0);
}

export function shortestPath(
  profile: FitProfile,
  university: FitUniversity,
  today: Date | string = TODAY,
): ShortestPathResult {
  const current = fitUniversity(profile, university, today);
  const from = current.suggestedCategory;
  const goal = goalFrom(from);
  if (!goal) {
    return {
      from,
      goal: null,
      combos: [],
      reason_ru: "Уже запасной — дальше категорию не поднять.",
    };
  }

  const levers = collectLevers(profile, university);
  const combos: PathCombo[] = [];
  const limit = Math.min(levers.length, 8);
  const maxMask = 1 << limit;
  for (let mask = 1; mask < maxMask; mask += 1) {
    const picked = subset(levers.slice(0, limit), mask);
    const nextFit = fitUniversity(applyLevers(profile, picked), university, today);
    if (rank(nextFit.suggestedCategory) < rank(goal)) continue;
    if (!nextFit.suggestedCategory) continue;
    combos.push({
      levers: picked,
      weeks: picked.reduce((sum, item) => sum + item.weeks, 0),
      category: nextFit.suggestedCategory,
      score: nextFit.score,
    });
  }

  combos.sort((a, b) => a.weeks - b.weeks || a.levers.length - b.levers.length);
  const unique: PathCombo[] = [];
  for (const combo of combos) {
    const key = combo.levers
      .map((item) => item.id)
      .sort()
      .join("|");
    if (unique.some((item) => item.levers.map((lever) => lever.id).sort().join("|") === key)) {
      continue;
    }
    unique.push(combo);
    if (unique.length === 3) break;
  }

  if (unique.length > 0) {
    return { from, goal, combos: unique, reason_ru: null };
  }

  const selective = from === "dream" && levers.length === 0 && current.checks.every((check) => check.status !== "below");
  if (selective) {
    return {
      from,
      goal,
      combos: [],
      reason_ru: "Вуз очень конкурентный — категория остаётся «Мечта» даже при закрытых требованиях.",
    };
  }
  return {
    from,
    goal,
    combos: [],
    reason_ru: "Нельзя поднять категорию экзаменами или GPA — упирается в специальность, бюджет или потолок баллов.",
  };
}
