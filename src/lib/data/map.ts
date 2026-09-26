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
    tuition_usd_per_year: row.tuition_usd_per_year,
    aid_for_internationals: row.aid_for_internationals,
    scholarships: row.scholarships,
    acceptance_rate: row.acceptance_rate,
    source_url: row.source_url,
    ielts_min: row.ielts_min ?? requirementNumber(requirements, ["ielts_min", "ielts"]),
    toefl_min: row.toefl_min ?? requirementNumber(requirements, ["toefl_min", "toefl"]),
    duolingo_min: row.duolingo_min ?? requirementNumber(requirements, ["duolingo_min", "duolingo"]),
    unt_min: row.unt_min ?? requirementNumber(requirements, ["unt_min", "unt"]),
    sat_policy: row.sat_policy,
    sat_total_min: row.sat_total_min ?? requirementNumber(requirements, ["sat_total_min", "sat_min"]),
    sat_total_max: row.sat_total_max,
    sat_middle_50: row.sat_middle_50,
  };
}

export function toFitProfile(profile: ProfileData): FitProfile {
  return {
    target_countries: profile.target_countries,
    intended_major: profile.intended_major,
    budget_usd: profile.budget_usd,
    needs_scholarship: profile.needs_scholarship,
    gpa: profile.gpa,
    gpa_scale: profile.gpa_scale,
    exams: profile.exams.map((exam) => ({
      code: exam.code,
      score: exam.score,
      status: exam.status,
    })),
  };
}
