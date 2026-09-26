import { shiftUtcDays, toUtcDateString } from "@/lib/matching/dates";
import {
  classifyDeadlines,
  LAST_CYCLE_WARNING_RU,
  type DeadlineEntry,
} from "@/lib/matching/deadlines";
import type { FitUniversity } from "@/lib/matching/types";
import { selectExamTargets, type ExamCatalogItem } from "@/lib/prep/plan";

export type RoadmapTaskDraft = {
  roadmapKey: string;
  title: string;
  description: string;
  dueDate: string | null;
  relatedType: "university" | "exam" | "opportunity" | null;
  relatedId: string | null;
  lastCycle: boolean;
};

const DOCUMENTS: Array<{
  key: string;
  title: string;
  daysBefore: number;
  body: string;
}> = [
  {
    key: "doc:recommendations",
    title: "Запросить рекомендации",
    daysBefore: 28,
    body: "Попросите рекомендации и напомните дедлайн отправителю.",
  },
  {
    key: "doc:cv",
    title: "Обновить CV",
    daysBefore: 21,
    body: "Проверьте CV: контакты, образование, навыки и достижения.",
  },
  {
    key: "doc:transcript",
    title: "Подготовить транскрипт",
    daysBefore: 21,
    body: "Закажите транскрипт или табель с оценками.",
  },
  {
    key: "doc:motivation",
    title: "Написать мотивационное письмо",
    daysBefore: 14,
    body: "Черновик мотивационного письма под ближайший дедлайн.",
  },
];

function roundSlug(round: string, index: number): string {
  const slug = round
    .toLocaleLowerCase("ru")
    .replace(/[^a-z0-9а-яё]+/gi, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  return slug || `round-${index + 1}`;
}

function describe(
  body: string,
  sourceUrl: string,
  lastCycle: boolean,
  cycleDate: string | null,
): string {
  const lines = [body];
  if (lastCycle) {
    lines.push(LAST_CYCLE_WARNING_RU);
    if (cycleDate) lines.push(`Дата прошлого цикла: ${cycleDate}`);
  }
  lines.push(sourceUrl);
  return lines.join("\n");
}

function earliestFuture(entries: DeadlineEntry[], today: string): DeadlineEntry | null {
  return classifyDeadlines(entries, today).upcoming[0] ?? null;
}

function earliestLastCycle(entries: DeadlineEntry[], today: string): DeadlineEntry | null {
  return classifyDeadlines(entries, today).lastCycle[0] ?? null;
}

export function buildRoadmap(
  shortlistUniversities: FitUniversity[],
  exams: ExamCatalogItem[],
  today: Date | string = new Date(),
): RoadmapTaskDraft[] {
  if (shortlistUniversities.length === 0) return [];
  const day = toUtcDateString(today);
  const examIds = new Map(exams.map((exam) => [exam.code, exam.id]));
  const tasks: RoadmapTaskDraft[] = [];
  const allDeadlines = shortlistUniversities.flatMap((university) => university.deadlines);
  const anchor = earliestFuture(allDeadlines, day);
  const staleAnchor = earliestLastCycle(allDeadlines, day);
  const anchorOwner =
    shortlistUniversities.find((university) =>
      university.deadlines.some(
        (entry) => entry.date === (anchor?.date ?? staleAnchor?.date),
      ),
    ) ?? shortlistUniversities[0];
  const anchorUrl = anchorOwner?.source_url ?? "";

  for (const target of selectExamTargets(shortlistUniversities)) {
    const requiring = shortlistUniversities.filter((university) =>
      university.id === target.universityId ||
      selectExamTargets([university]).some((item) => item.code === target.code),
    );
    const deadlines = requiring.flatMap((university) => university.deadlines);
    const upcoming = earliestFuture(deadlines, day);
    const stale = earliestLastCycle(deadlines, day);
    const lastCycle = !upcoming && stale != null;
    tasks.push({
      roadmapKey: `exam-register:${target.code}`,
      title: `Зарегистрироваться на ${target.code}`,
      description: describe(
        `Регистрация на ${target.code}. Ориентир балла: ${target.target} (${target.universityName}).`,
        target.sourceUrl,
        lastCycle,
        stale?.date ?? null,
      ),
      dueDate: upcoming ? shiftUtcDays(upcoming.date, -42) : null,
      relatedType: "exam",
      relatedId: examIds.get(target.code) ?? null,
      lastCycle,
    });
  }

  const documentsLastCycle = !anchor && staleAnchor != null;
  for (const document of DOCUMENTS) {
    tasks.push({
      roadmapKey: document.key,
      title: document.title,
      description: describe(
        document.body,
        anchorUrl,
        documentsLastCycle,
        staleAnchor?.date ?? null,
      ),
      dueDate: anchor ? shiftUtcDays(anchor.date, -document.daysBefore) : null,
      relatedType: null,
      relatedId: null,
      lastCycle: documentsLastCycle,
    });
  }

  for (const university of shortlistUniversities) {
    const used = new Set<string>();
    university.deadlines.forEach((entry, index) => {
      let slug = roundSlug(entry.round, index);
      if (used.has(slug)) slug = `${slug}-${index + 1}`;
      used.add(slug);
      const classified = classifyDeadlines([entry], day);
      const lastCycle = classified.lastCycle.length > 0;
      const upcoming = classified.upcoming.length > 0;
      tasks.push({
        roadmapKey: `apply:${university.id}:${slug}`,
        title: `Подать заявку: ${university.name}, ${entry.round}`,
        description: describe(
          `Раунд «${entry.round}».`,
          university.source_url,
          lastCycle,
          lastCycle ? entry.date : null,
        ),
        dueDate: upcoming || classified.expired.length > 0 ? entry.date : null,
        relatedType: "university",
        relatedId: university.id,
        lastCycle,
      });
    });
  }

  return tasks;
}
