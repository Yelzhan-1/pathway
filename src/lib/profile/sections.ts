import type { CompletenessField, ProfileCompleteness } from "./completeness";
import { PROFILE_COMPLETENESS_WEIGHTS } from "./completeness";
import { strings } from "@/lib/strings";

export type ProfileSectionId = "basics" | "goals" | "budget" | "english" | "academics";

const SECTION_FIELDS: Record<ProfileSectionId, CompletenessField[]> = {
  basics: ["full_name", "path", "grade_or_year", "city", "intake_year"],
  goals: ["intended_major", "target_countries"],
  budget: ["budget"],
  english: ["english_level", "exams"],
  academics: ["gpa"],
};

export type ProfileSectionProgress = {
  id: ProfileSectionId;
  title: string;
  percent: number;
  done: boolean;
  href: string;
};

/** Per-section completion, derived from the same weights as the overall profile percent. Purely presentational — does not change the form or scoring. */
export function profileSectionProgress(completeness: ProfileCompleteness): ProfileSectionProgress[] {
  const missing = new Set(completeness.missing.map((item) => item.field));
  return (Object.keys(SECTION_FIELDS) as ProfileSectionId[]).map((id) => {
    const fields = SECTION_FIELDS[id];
    const total = fields.reduce((sum, field) => sum + PROFILE_COMPLETENESS_WEIGHTS[field], 0);
    const earned = fields.reduce(
      (sum, field) => sum + (missing.has(field) ? 0 : PROFILE_COMPLETENESS_WEIGHTS[field]),
      0,
    );
    const percent = total === 0 ? 100 : Math.round((earned / total) * 100);
    return {
      id,
      title: strings.profile.sections[id],
      percent,
      done: percent >= 100,
      href: `/profile#${id}`,
    };
  });
}
