import { examLabel } from "@/lib/labels/display";
import { daysBetween, toUtcDateString } from "@/lib/matching/dates";
import {
  classifyDeadlines,
  LAST_CYCLE_WARNING_RU,
  type DeadlineEntry,
} from "@/lib/matching/deadlines";
import type { FitProfile, FitUniversity } from "@/lib/matching/types";

export type ExamCatalogItem = {
  id: string;
  code: string;
  name: string;
  official_url: string | null;
  source_url: string;
  typical_test_dates_note: string | null;
};

export type ExamTarget = {
  code: string;
  target: number;
  universityId: string;
  universityName: string;
  sourceUrl: string;
};

export type PrepMilestone = {
  week: number;
  title_ru: string;
  kind: "template";
};

export type PrepExamPlan = {
  code: string;
  examName: string | null;
  target: number;
  targetUniversityId: string;
  targetUniversityName: string;
  current: number | null;
  gap: number | null;
  weeksUntilDeadline: number | null;
  deadlineDate: string | null;
  lastCycleWarning: string | null;
  milestones: PrepMilestone[];
  officialUrl: string | null;
  sourceUrl: string | null;
};

export type PrepPlan = {
  exams: PrepExamPlan[];
  kind: "template";
};

const MILESTONE_TITLES = [
  "Регистрация и диагностический тест",
  "Разбор ошибок по слабым темам",
  "Практика в условиях таймера",
  "Полный пробный экзамен",
] as const;

type RequirementSpec = {
  code: string;
  read: (university: FitUniversity) => number | null;
};

const REQUIREMENTS: RequirementSpec[] = [
  { code: "IELTS", read: (university) => university.ielts_min },
  { code: "TOEFL_IBT", read: (university) => university.toefl_min },
  { code: "DET", read: (university) => university.duolingo_min },
  {
    code: "SAT",
    read: (university) =>
      university.sat_policy === "required" ? university.sat_total_min : null,
  },
  { code: "UNT", read: (university) => university.unt_min },
  {
    code: "NUET",
    read: (university) => {
      const value = university.requirements?.nuet_min;
      return typeof value === "number" && Number.isFinite(value) ? value : null;
    },
  },
];

const LANGUAGE_CODES = new Set(["IELTS", "TOEFL_IBT", "DET"]);

function languageRequirementMet(profile: FitProfile, university: FitUniversity): boolean {
  const options = [
    { code: "IELTS", min: university.ielts_min },
    { code: "TOEFL_IBT", min: university.toefl_min },
    { code: "DET", min: university.duolingo_min },
  ].filter((option) => option.min != null);
  if (options.length === 0) return true;
  return options.some((option) => {
    const score = takenScore(profile, option.code);
    return score != null && option.min != null && score + 1e-9 >= option.min;
  });
}

export function selectExamTargets(
  universities: FitUniversity[],
  profile: FitProfile | null = null,
): ExamTarget[] {
  const targets: ExamTarget[] = [];
  for (const spec of REQUIREMENTS) {
    const source =
      profile && LANGUAGE_CODES.has(spec.code)
        ? universities.filter((university) => !languageRequirementMet(profile, university))
        : universities;
    let best: ExamTarget | null = null;
    for (const university of source) {
      const value = spec.read(university);
      if (value == null) continue;
      if (
        !best ||
        value > best.target ||
        (value === best.target && university.name.localeCompare(best.universityName, "ru") < 0)
      ) {
        best = {
          code: spec.code,
          target: value,
          universityId: university.id,
          universityName: university.name,
          sourceUrl: university.source_url,
        };
      }
    }
    if (best) targets.push(best);
  }
  return targets;
}

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

function universitiesRequiring(code: string, universities: FitUniversity[]): FitUniversity[] {
  const spec = REQUIREMENTS.find((item) => item.code === code);
  if (!spec) return [];
  return universities.filter((university) => spec.read(university) != null);
}

function relevantDeadline(
  universities: FitUniversity[],
  today: string,
): { upcoming: DeadlineEntry | null; lastCycle: DeadlineEntry | null } {
  const entries = universities.flatMap((university) => university.deadlines);
  const classified = classifyDeadlines(entries, today);
  return {
    upcoming: classified.upcoming[0] ?? null,
    lastCycle: classified.lastCycle[0] ?? null,
  };
}

export function weeklyMilestones(weeks: number | null): PrepMilestone[] {
  if (weeks == null || weeks <= 0) {
    return [
      {
        week: 1,
        title_ru: "Уточните дату на сайте вуза и пройдите диагностический тест",
        kind: "template",
      },
    ];
  }
  const count = Math.min(MILESTONE_TITLES.length, weeks);
  const milestones: PrepMilestone[] = [];
  for (let index = 0; index < count; index += 1) {
    const week =
      count === 1 ? 1 : Math.round((index * (weeks - 1)) / (count - 1)) + 1;
    milestones.push({
      week,
      title_ru: MILESTONE_TITLES[index]!,
      kind: "template",
    });
  }
  return milestones;
}

export function examAlreadyMet(profile: FitProfile, code: string, target: number): boolean {
  const current = takenScore(profile, code);
  return current != null && current >= target;
}

export function prepPlan(
  profile: FitProfile,
  shortlistUniversities: FitUniversity[],
  exams: ExamCatalogItem[],
  today: Date | string = new Date(),
): PrepPlan {
  const day = toUtcDateString(today);
  const catalog = new Map(exams.map((exam) => [exam.code, exam]));
  const plans = selectExamTargets(shortlistUniversities, profile)
    .filter((target) => !examAlreadyMet(profile, target.code, target.target))
    .map((target) => {
    const current = takenScore(profile, target.code);
    const deadline = relevantDeadline(
      universitiesRequiring(target.code, shortlistUniversities),
      day,
    );
    const weeksUntilDeadline = deadline.upcoming
      ? Math.floor(daysBetween(day, deadline.upcoming.date) / 7)
      : null;
    const catalogExam = catalog.get(target.code);
    const lastCycleWarning = deadline.upcoming
      ? null
      : deadline.lastCycle
        ? `${LAST_CYCLE_WARNING_RU} (${deadline.lastCycle.date}). ${target.sourceUrl}`
        : null;
    return {
      code: target.code,
      examName: catalogExam?.name ?? examLabel(target.code),
      target: target.target,
      targetUniversityId: target.universityId,
      targetUniversityName: target.universityName,
      current,
      gap: current == null ? null : target.target - current,
      weeksUntilDeadline,
      deadlineDate: deadline.upcoming?.date ?? null,
      lastCycleWarning,
      milestones: weeklyMilestones(weeksUntilDeadline),
      officialUrl: catalogExam?.official_url ?? null,
      sourceUrl: catalogExam?.source_url ?? target.sourceUrl,
    };
  });
  return { exams: plans, kind: "template" };
}
