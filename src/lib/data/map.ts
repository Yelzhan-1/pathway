import { coerceFinite, resolveAcceptanceRate } from "@/data/catalog-acceptance";
import type { Database } from "@/lib/database.types";
import { asRecord, parseDeadlineEntries } from "@/lib/matching/deadlines";
import type { FitProfile, FitUniversity } from "@/lib/matching/types";
import type { ProfileData } from "@/lib/profile/types";

function requirementNumber(
  requirements: Record<string, unknown> | null,
  keys: string[],
): number | null {
  if (!requirements) return null;
  for (const key of keys) {
    const raw = requirements[key];
    const value =
      typeof raw === "number"
        ? raw
        : typeof raw === "string" && raw.trim()
          ? Number(raw.trim().replace(",", "."))
          : null;
    if (typeof value === "number" && Number.isFinite(value)) return value;
  }
  return null;
}

export function toFitUniversity(
  row: Database["public"]["Tables"]["universities"]["Row"],
): FitUniversity {
  const requirements = asRecord(row.requirements);
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    country: row.country,
    city: row.city,
    region: row.region,
    majors: row.majors,
    requirements,
    deadlines: parseDeadlineEntries(row.deadlines),
    tuition_usd_per_year: coerceFinite(row.tuition_usd_per_year),
    aid_for_internationals: row.aid_for_internationals,
    scholarships: row.scholarships,
    acceptance_rate: resolveAcceptanceRate(row.slug, row.acceptance_rate),
    source_url: row.source_url,
    ielts_min: coerceFinite(row.ielts_min) ?? requirementNumber(requirements, ["ielts_min", "ielts"]),
    toefl_min: coerceFinite(row.toefl_min) ?? requirementNumber(requirements, ["toefl_min", "toefl"]),
    duolingo_min: coerceFinite(row.duolingo_min) ?? requirementNumber(requirements, ["duolingo_min", "duolingo"]),
    unt_min: coerceFinite(row.unt_min) ?? requirementNumber(requirements, ["unt_min", "unt"]),
    sat_policy: row.sat_policy,
    sat_total_min: coerceFinite(row.sat_total_min) ?? requirementNumber(requirements, ["sat_total_min", "sat_min"]),
    sat_total_max: coerceFinite(row.sat_total_max),
    sat_middle_50: row.sat_middle_50,
  };
}

function numeric(value: number | string | null | undefined): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value.trim().replace(",", "."));
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

export function toFitProfile(profile: ProfileData): FitProfile {
  return {
    target_countries: profile.target_countries,
    intended_major: profile.intended_major,
    budget_usd: numeric(profile.budget_usd as number | string | null),
    needs_scholarship: profile.needs_scholarship,
    gpa: numeric(profile.gpa as number | string | null),
    gpa_scale: numeric(profile.gpa_scale as number | string | null),
    exams: profile.exams.map((exam) => ({
      code: exam.code,
      score: exam.score,
      status: exam.status,
    })),
  };
}
