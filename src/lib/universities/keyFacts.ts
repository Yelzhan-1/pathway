import { formatMoneyUsd, aidLabel } from "@/lib/labels/display";
import { isGrantAid } from "@/lib/matching/budget";
import { strings } from "@/lib/strings";

export type KeyFactIcon = "price" | "grant" | "ielts";
export type KeyFact = { icon: KeyFactIcon; value: string };

/**
 * Up to 3 key-fact chips for a university card/hero: цена, грант, IELTS.
 * Only real catalog data — a missing field is simply skipped, never guessed.
 */
export function universityKeyFacts(university: {
  tuition_usd_per_year: number | null;
  aid_for_internationals: string | null;
  ielts_min: number | null;
}): KeyFact[] {
  const facts: KeyFact[] = [];

  if (university.tuition_usd_per_year != null) {
    facts.push({
      icon: "price",
      value: university.tuition_usd_per_year === 0 ? strings.universities.freeTuition : formatMoneyUsd(university.tuition_usd_per_year),
    });
  }

  const grant = aidLabel(university.aid_for_internationals);
  if (grant || isGrantAid(university.aid_for_internationals)) {
    facts.push({ icon: "grant", value: grant ?? strings.universities.freeTuition });
  }

  if (university.ielts_min != null) {
    facts.push({ icon: "ielts", value: `IELTS ${university.ielts_min}+` });
  }

  return facts.slice(0, 3);
}
