import { strings } from "@/lib/strings";

import { EXAM_CODES, type ExamCode } from "./exam-ranges";
import {
  BUDGET_OPTIONS,
  ENGLISH_LEVELS,
  type EnglishLevel,
  type ExamEntry,
} from "./types";

const ENGLISH_LEVEL_SET = new Set<string>(ENGLISH_LEVELS);

export function getExamCodeLabel(code: string): string {
  if ((EXAM_CODES as readonly string[]).includes(code)) {
    return strings.profile.exam.names[code as ExamCode];
  }
  return code;
}

export function getEnglishLevelLabel(level: string | null | undefined): string {
  if (level == null || level === "") return "";
  if (!ENGLISH_LEVEL_SET.has(level)) return level;
  return strings.onboarding.steps.english.levels[level as EnglishLevel];
}

export function getBudgetLabel(budgetUsd: number | null | undefined): string {
  if (budgetUsd == null) return "";
  const option = BUDGET_OPTIONS.find((item) => item.value === budgetUsd);
  if (!option) return `${budgetUsd} $`;
  return strings.onboarding.steps.budget.ranges[option.labelKey];
}

export function formatExamEntry(
  exam: ExamEntry,
  plannedLabel?: string,
): string {
  const subject = exam.subject ? ` (${exam.subject})` : "";
  const planned =
    exam.status === "planned" && plannedLabel ? ` ${plannedLabel}` : "";
  return `${getExamCodeLabel(exam.code)}${subject}: ${exam.score}${planned}`;
}
