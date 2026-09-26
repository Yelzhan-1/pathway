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
