import { englishRequirementLabel } from "@/lib/agent/university-facts";
import type { UniversityWithFit } from "@/lib/data/load";
import { aidLabel, roundLabel } from "@/lib/labels/display";
import { getCountryLabel } from "@/lib/profile/types";

/**
 * Only real catalog fields — never anything computed/guessed. Fed to the model so it can
 * judge «связь с вузом и программой» without inventing facts about the university.
 */
export type EssayUniversityFacts = {
  name: string;
  country: string;
  city: string | null;
  majors: string[] | null;
  tuitionUsdPerYear: number | null;
  aid: string | null;
  scholarships: string | null;
  englishRequirementRu: string;
  deadlines: { round: string; date: string }[];
};

export function essayUniversityFacts(item: UniversityWithFit): EssayUniversityFacts {
  return {
    name: item.name,
    country: item.country,
    city: item.city,
    majors: item.majors,
    tuitionUsdPerYear: item.tuition_usd_per_year,
    aid: aidLabel(item.aid_for_internationals),
    scholarships: item.scholarships,
    englishRequirementRu: englishRequirementLabel(item.fit),
    deadlines: item.deadlines.map((deadline) => ({ round: deadline.round, date: deadline.date })),
  };
}

/** Plain-text block for the model prompt — one fact per line, nothing invented. */
export function essayUniversityFactsText(facts: EssayUniversityFacts): string {
  const lines = [`Название: ${facts.name}`, `Страна: ${getCountryLabel(facts.country)}${facts.city ? `, ${facts.city}` : ""}`];
  if (facts.majors?.length) lines.push(`Программы в базе: ${facts.majors.join(", ")}`);
  if (facts.tuitionUsdPerYear != null) lines.push(`Стоимость: ${facts.tuitionUsdPerYear} $ в год`);
  if (facts.aid) lines.push(`Финансовая помощь: ${facts.aid}`);
  if (facts.scholarships?.trim()) lines.push(`Стипендии: ${facts.scholarships.trim()}`);
  lines.push(`Требование английского: ${facts.englishRequirementRu}`);
  if (facts.deadlines.length) {
    lines.push(`Дедлайны: ${facts.deadlines.map((deadline) => `${roundLabel(deadline.round)} — ${deadline.date}`).join("; ")}`);
  }
  return lines.join("\n");
}
