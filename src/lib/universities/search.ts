import { classifyDeadlines } from "@/lib/matching/deadlines";
import type { DeadlineEntry } from "@/lib/matching/deadlines";
import type { UniversityFilters } from "@/lib/matching/types";

export const UNIVERSITY_REGIONS = ["kazakhstan", "usa", "uk", "europe", "asia_other"] as const;
export type UniversityRegion = (typeof UNIVERSITY_REGIONS)[number];

export type DeadlineFilter = "upcoming" | "last_cycle";

export function firstParam(value: string | string[] | undefined): string {
  return typeof value === "string" ? value.trim() : "";
}

function isRegion(value: string): value is UniversityRegion {
  return (UNIVERSITY_REGIONS as readonly string[]).includes(value);
}

export function parseUniversityQuery(params: {
  q?: string | string[];
  region?: string | string[];
  country?: string | string[];
  major?: string | string[];
  deadline?: string | string[];
}): { filters: UniversityFilters; deadline: DeadlineFilter | null } {
  const q = firstParam(params.q);
  const region = firstParam(params.region);
  const country = firstParam(params.country);
  const major = firstParam(params.major);
  const deadlineRaw = firstParam(params.deadline);
  return {
    filters: {
      query: q || undefined,
      region: isRegion(region) ? region : undefined,
      country: country || undefined,
      major: major || undefined,
    },
    deadline: deadlineRaw === "upcoming" || deadlineRaw === "last_cycle" ? deadlineRaw : null,
  };
}

export function matchesDeadlineFilter(
  deadlines: DeadlineEntry[],
  today: string,
  filter: DeadlineFilter,
): boolean {
  const classified = classifyDeadlines(deadlines, today);
  if (filter === "upcoming") return classified.upcoming.length > 0;
  return classified.lastCycle.length > 0;
}

const NAME_STOP_WORDS = new Set(["of", "and", "the", "for", "de", "da"]);

export function normalizeIdentity(value: string): string {
  return value.trim().toLocaleLowerCase("ru").replace(/[^a-zа-яё0-9]+/gi, "");
}

/** Case-insensitive slug, full name, or short name (acronym / hyphen-stripped slug). */
export function matchesUniversityIdentity(
  query: string,
  row: { slug: string; name: string },
): boolean {
  const raw = query.trim();
  if (!raw) return false;
  const needle = normalizeIdentity(raw);
  if (!needle) return false;
  const slug = normalizeIdentity(row.slug);
  const name = normalizeIdentity(row.name);
  if (needle === slug || needle === name) return true;
  const words = row.name.split(/[^A-Za-zА-Яа-яЁё0-9]+/).filter((word) => word.length > 0);
  const acronym = words
    .filter((word) => !NAME_STOP_WORDS.has(word.toLocaleLowerCase("en")))
    .map((word) => word[0] ?? "")
    .join("")
    .toLocaleLowerCase("en");
  return acronym.length >= 3 && needle === acronym;
}
