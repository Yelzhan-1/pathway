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

/** Russian orientation from a card note. Empty when the card has no such note. */
export function englishOrientationRu(requirements: Record<string, unknown> | null): string | null {
  if (!requirements) return null;
  const other = typeof requirements.other === "string" ? requirements.other.trim() : "";
  if (!other) return null;
  if (/english/i.test(other) && /recommended/i.test(other) && /not mandatory/i.test(other)) {
    return "по сторонним источникам тест рекомендуют, но он не обязателен";
  }
  return null;
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
    const orientation = input.orientationRu?.trim();
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
  return `Вуз уже найден: ${input.name} (slug: ${input.slug}). До ответа вызови getUniversityDetails со slug ${input.slug}. Требование английского с карточки: ${sentence}${source}`;
}
