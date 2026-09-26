import { catalogRussian } from "@/data/catalog-ru";
import { getExamCodeLabel } from "@/lib/profile/labels";
import { strings } from "@/lib/strings";

const INTERNAL_NOTE =
  /scanned\s+pdf|price\s+list|spreadsheet|internal\s+note|todo\b|fixme\b|see\s+the\s+attached|published as a scanned/i;

const ROUND_LABELS: Record<string, string> = {
  rd: "Основной",
  regular: "Основной",
  "regular decision": "Основной",
  main: "Основной",
  ea: "Ранний",
  early: "Ранний",
  "early action": "Ранний",
  ed: "Раннее решение",
  "early decision": "Раннее решение",
  rolling: "Скользящий",
  "rolling admission": "Скользящий",
  rea: "Ограниченный ранний приём",
  "restrictive early action": "Ограниченный ранний приём",
  scea: "Единственный ранний приём",
  "single-choice early action": "Единственный ранний приём",
  "single choice early action": "Единственный ранний приём",
  ra: "Основной",
};

const AID_LABELS: Record<string, string> = {
  need_blind: "Без учёта дохода",
  need_aware: "С учётом дохода",
  merit: "За успехи",
  none: "без гранта для иностранцев",
  unknown: "помощь неизвестна",
  funded: "С финансированием",
  full_ride: "Полное покрытие",
};

export function formatMoneyUsd(amount: number): string {
  const formatted = Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${formatted} $`;
}

export function aidLabel(value: string | null | undefined): string | null {
  if (!value?.trim()) return null;
  const key = value.trim().toLowerCase().replace(/\s+/g, "_");
  if (key in AID_LABELS) return AID_LABELS[key];
  if (value in strings.universities.aid) {
    return strings.universities.aid[value as keyof typeof strings.universities.aid];
  }
  if (/funded|финанс/i.test(value)) return AID_LABELS.funded;
  if (isInternalNote(value)) return null;
  return value;
}

export function roundLabel(round: string): string {
  const key = round.trim().toLowerCase().replace(/\s+/g, " ");
  return ROUND_LABELS[key] ?? round.replace(/\s*\(offered\)\s*/gi, "").trim();
}

export function isInternalNote(value: string | null | undefined): boolean {
  if (!value?.trim()) return true;
  return INTERNAL_NOTE.test(value);
}

export function publicNote(value: string | null | undefined): string | null {
  if (!value?.trim() || isInternalNote(value)) return null;
  const text = value.trim();
  return catalogRussian(text) ?? text;
}


/** Opportunity and catalog titles. A stored English sentence is replaced by its Russian version. */
export function displayTitle(value: string | null | undefined): string {
  const text = value?.trim();
  if (!text) return "";
  return catalogRussian(text) ?? text;
}

function translatePaidCost(text: string): string {
  return text
    .replace(/^paid:\s*/i, "платно: ")
    .replace(
      /need-based discounts up to free incl\. travel/gi,
      "скидки по потребности вплоть до бесплатно, включая проезд",
    )
    .replace(
      /need-based aid up to full tuition for domestic and international students/gi,
      "помощь по потребности до полной стоимости обучения для своих и иностранных студентов",
    )
    .replace(/need-based aid available/gi, "есть помощь по потребности")
    .replace(/need-based scholarships/gi, "стипендии по потребности")
    .replace(
      /financial aid available \(limited travel support for internationals\)/gi,
      "есть финансовая помощь (ограниченная поддержка проезда для иностранцев)",
    )
    .replace(/financial aid available/gi, "есть финансовая помощь")
    .replace(/program fee/gi, "взнос за программу")
    .replace(/tuition/gi, "обучение")
    .replace(/max USD ([0-9,]+)/gi, "максимум $1 $")
    .replace(/up to USD ([0-9,]+)/gi, "до $1 $")
    .replace(/USD ([0-9,]+)/gi, "$1 $")
    .replace(/fees with /gi, "взносы, ")
    .replace(/Innovation Stage entry fee \(amount not captured\)/gi, "взнос этапа Innovation Stage (сумма не указана)");
}

/** Show a stored cost in Russian. A full translated sentence wins over token rules. */
export function displayCost(cost: string | null | undefined): string | null {
  if (cost == null) return null;
  const text = cost.trim();
  if (!text) return null;
  const mapped = catalogRussian(text);
  if (mapped) return mapped;
  if (/^free$/i.test(text)) return "бесплатно";
  if (/^funded$/i.test(text)) return "с финансированием";
  if (/^unknown$/i.test(text)) return "стоимость не указана";
  if (/^paid:/i.test(text)) return translatePaidCost(text);
  return text;
}

export function examLabel(code: string): string {
  return getExamCodeLabel(code);
}
