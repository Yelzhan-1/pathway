import { formatMoneyUsd } from "@/lib/labels/display";
import { strings } from "@/lib/strings";
import { matchesUniversityIdentity } from "@/lib/universities/search";

export type UniversityName = { slug: string; name: string };

const MAX_NAME_WORDS = 8;

/** First university a free-text message names, using the case-insensitive identity resolver. */
export function universityNamedInMessage(
  message: string,
  catalog: readonly UniversityName[],
): UniversityName | null {
  const words = message.split(/[^A-Za-zА-Яа-яЁё0-9]+/).filter((word) => word.length > 0);
  if (words.length === 0 || catalog.length === 0) return null;
  let best: { start: number; length: number; row: UniversityName } | null = null;
  for (let start = 0; start < words.length; start += 1) {
    const limit = Math.min(MAX_NAME_WORDS, words.length - start);
    for (let length = limit; length >= 1; length -= 1) {
      const phrase = words.slice(start, start + length).join(" ");
      const row = catalog.find((item) => matchesUniversityIdentity(phrase, item));
      if (!row) continue;
      if (!best || start < best.start || (start === best.start && length > best.length)) {
        best = { start, length, row };
      }
      break;
    }
  }
  return best?.row ?? null;
}

/** Every catalog university named in the text, earliest first. */
export function universitiesNamedInMessage(
  message: string,
  catalog: readonly UniversityName[],
): UniversityName[] {
  const words = message.split(/[^A-Za-zА-Яа-яЁё0-9]+/).filter((word) => word.length > 0);
  const found: UniversityName[] = [];
  const seen = new Set<string>();
  let start = 0;
  while (start < words.length) {
    const limit = Math.min(MAX_NAME_WORDS, words.length - start);
    let matched: { length: number; row: UniversityName } | null = null;
    for (let length = limit; length >= 1; length -= 1) {
      const phrase = words.slice(start, start + length).join(" ");
      const row = catalog.find((item) => matchesUniversityIdentity(phrase, item));
      if (!row) continue;
      matched = { length, row };
      break;
    }
    if (!matched) {
      start += 1;
      continue;
    }
    if (!seen.has(matched.row.slug)) {
      seen.add(matched.row.slug);
      found.push(matched.row);
    }
    start += matched.length;
  }
  return found;
}

export function forcedToolChoice(
  stepNumber: number,
  slug: string | null,
): { type: "tool"; toolName: "getUniversityDetails" } | undefined {
  if (!slug || stepNumber !== 0) return undefined;
  return { type: "tool", toolName: "getUniversityDetails" };
}

export type EnglishLookupInput = {
  name: string;
  ieltsMin: number | null;
  toeflMin: number | null;
  duolingoMin: number | null;
  englishRequirementRu: string;
  orientationRu: string | null;
};

function statedCardNote(value: string | null): string | null {
  const text = value?.trim();
  if (!text) return null;
  if (/сторонн|secondary sources|recommended|not mandatory/i.test(text)) return null;
  return text;
}

function hasPublishedEnglishMinimum(input: EnglishLookupInput): boolean {
  if (input.ieltsMin != null || input.toeflMin != null || input.duolingoMin != null) return true;
  const label = input.englishRequirementRu.trim();
  return label.length > 0 && label !== strings.fit.check.unknown;
}

/** The English-requirement sentence for a found university card. */
export function englishLookupLine(input: EnglishLookupInput): string {
  if (!hasPublishedEnglishMinimum(input)) {
    const base = `${input.name} не публикует минимальный IELTS/TOEFL`;
    const orientation = statedCardNote(input.orientationRu);
    if (orientation) return `${base}; ориентир: ${orientation}`;
    return `${base}.`;
  }
  return `${input.name}: ${input.englishRequirementRu.trim()}`;
}

export function universityFactsContext(
  input: EnglishLookupInput & { slug: string; sourceUrl: string | null },
): string {
  const line = englishLookupLine(input);
  const sentence = line.endsWith(".") ? line : `${line}.`;
  const source = input.sourceUrl ? ` Источник: ${input.sourceUrl}.` : "";
  return `Вуз уже найден: ${input.name} (slug: ${input.slug}). Отвечай только про ${input.name}. Не упоминай другие вузы из истории. До ответа вызови getUniversityDetails со slug ${input.slug}. Требование английского с карточки: ${sentence}${source}`;
}

const MATCH_QUESTION = /вуз|университет|подход|грант|стипенд/i;

/** A general “which universities fit me” question, not a question about one named university. */
export function asksForUniversityMatches(message: string, catalog: readonly UniversityName[]): boolean {
  if (universityNamedInMessage(message, catalog)) return false;
  return MATCH_QUESTION.test(message);
}

export function wantsGrantMatches(message: string): boolean {
  return /грант|стипенд/i.test(message);
}

/** General questions are answered from the injected matches. No university-details tool call. */
export function generalQuestionStep(enabled: boolean): { toolChoice: "none" } | undefined {
  if (!enabled) return undefined;
  return { toolChoice: "none" };
}

export function fitCategoryRu(category: string | null | undefined): string {
  if (category === "dream" || category === "target" || category === "safety") {
    return strings.fit.category[category];
  }
  return "без категории";
}

export type AgentProfileFacts = {
  intendedMajor: string | null;
  budgetUsd: number | null;
  needsScholarship: boolean;
  exams: { code: string; score: string }[];
  shortlist: { name: string; category: string }[];
};

export type AgentMatch = {
  name: string;
  categoryRu: string;
  grantRu: string;
  sourceUrl: string;
};

/** Facts already stored for this user, plus the universities the matcher returned. */
export function profileMatchContext(input: {
  profile: AgentProfileFacts;
  matches: readonly AgentMatch[];
  grantOnly: boolean;
}): string {
  const major = input.profile.intendedMajor?.trim() || "не указана";
  const budget = input.profile.budgetUsd == null ? "не указан" : formatMoneyUsd(input.profile.budgetUsd);
  const scholarship = input.profile.needsScholarship ? "нужна" : "не нужна";
  const exams = input.profile.exams.length
    ? input.profile.exams.map((exam) => `${exam.code} ${exam.score}`).join(", ")
    : "нет";
  const shortlist = input.profile.shortlist.length
    ? input.profile.shortlist.map((item) => `${item.name} (${item.category})`).join("; ")
    : "пуст";
  const lines = input.matches
    .slice(0, 6)
    .map((item) => `${item.name}: ${item.categoryRu}. Грант: ${item.grantRu}. Источник: ${item.sourceUrl}`);
  return [
    "Профиль уже загружен. Не спрашивай специальность, бюджет, стипендию, баллы и шортлист.",
    `Специальность: ${major}. Бюджет: ${budget}. Стипендия: ${scholarship}. Баллы: ${exams}. Шортлист: ${shortlist}.`,
    input.grantOnly
      ? "Подборка вузов с грантом или бесплатным обучением:"
      : "Подборка вузов по профилю:",
    lines.length > 0 ? lines.join("\n") : "в подборке нет вузов.",
    "Ответь только по-русски этими вузами: категория и грант. Не вызывай getUniversityDetails и не передавай список имён в инструмент.",
  ].join("\n");
}

/** Drop history about a different university when the current message names one. */
export function historyForCurrentUniversity<T extends { role: "user" | "assistant"; content: string }>(
  rows: readonly T[],
  currentMessage: string,
  catalog: readonly UniversityName[],
): T[] {
  const current = universityNamedInMessage(currentMessage, catalog);
  if (!current) return [...rows];
  const kept: T[] = [];
  for (const row of rows) {
    const named = universitiesNamedInMessage(row.content, catalog);
    if (named.some((item) => item.slug !== current.slug)) {
      const previous = kept.at(-1);
      if (row.role === "assistant" && previous?.role === "user") {
        const previousNames = universitiesNamedInMessage(previous.content, catalog);
        const onlyCurrent =
          previousNames.length > 0 && previousNames.every((item) => item.slug === current.slug);
        if (!onlyCurrent) kept.pop();
      }
      continue;
    }
    kept.push(row);
  }
  return kept;
}
