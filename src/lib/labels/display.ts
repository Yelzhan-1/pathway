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
  return value.trim();
}

export function examLabel(code: string): string {
  return getExamCodeLabel(code);
}
