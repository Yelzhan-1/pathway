import { toUtcDateString } from "@/lib/matching/dates";

export type OpportunityProfile = {
  grade_or_year: string | null;
  path: "graduate" | "transfer" | null;
};

export type OpportunityInput = {
  id?: string;
  slug: string;
  title: string;
  type: string;
  field?: string | null;
  description?: string | null;
  eligibility: string | null;
  grades: string[] | null;
  deadline: string | null;
  deadline_note?: string | null;
  cost: string | null;
  format: string | null;
  url?: string | null;
  source_url: string;
};

export type OpportunityFilters = {
  type?: string | null;
  format?: string | null;
  freeOnly?: boolean;
  upcomingOnly?: boolean;
};

/**
 * Free-cost heuristics (tested):
 * - empty or unclear text → null (not treated as free)
 * - free: "free", "бесплатно/ая/ый/ые", "fully funded", "full scholarship",
 *   "no cost", "$0", "0 USD"
 * - paid: "not free", "не бесплатно", "платно", "paid", a positive amount with $, USD, EUR, or GBP,
 *   "tuition", "fee"
 * "бесплатно" is free even though it contains "платно". A positive amount is paid.
 * "not free" and "не бесплатно" are paid.
 */
export function isFreeCost(cost: string | null | undefined): boolean | null {
  if (cost == null) return null;
  const text = cost.trim().toLocaleLowerCase("ru");
  if (!text) return null;
  if (/\bnot\s+free\b|не\s*бесплат|\bpaid\b/.test(text)) return false;
  if (
    /(^|[^a-zа-яё])(free|бесплатно|бесплатная|бесплатный|бесплатные|fully funded|full scholarship|no cost)([^a-zа-яё]|$)|(?:\$|usd)\s*0\b|\b0\s*(?:usd|\$)/.test(
      text,
    )
  ) {
    return true;
  }
  if (/(?:\$|usd|eur|€|£)\s*[1-9]\d*|\b[1-9]\d*\s*(?:usd|\$|eur|€|£)/.test(text)) {
    return false;
  }
  if (/\btuition\b|\bfee\b|платно/.test(text)) return false;
  return null;
}

function normalize(value: string): string {
  return value.trim().toLocaleLowerCase("ru").replace(/\s+/g, " ");
}

const GRADUATE_LEVEL =
  /master'?s|\bmsc\b|\bma\b|doctoral|doctorate|ph\.?\s*d|аспирант|докторант|магистер|магистратур|graduate school|postgraduate/i;

export function parseGradeNumbers(value: string | null | undefined): number[] {
  if (!value?.trim()) return [];
  const text = value.toLocaleLowerCase("ru");
  const range = text.match(/(\d{1,2})\s*[-–—]\s*(\d{1,2})/);
  if (range) {
    const start = Number(range[1]);
    const end = Number(range[2]);
    if (!Number.isFinite(start) || !Number.isFinite(end)) return [];
    const from = Math.min(start, end);
    const to = Math.max(start, end);
    const nums: number[] = [];
    for (let grade = from; grade <= to; grade += 1) nums.push(grade);
    return nums;
  }
  const single = text.match(/(\d{1,2})/);
  if (!single) return [];
  const grade = Number(single[1]);
  return Number.isFinite(grade) ? [grade] : [];
}

export function gradeMatches(grade: string | null, grades: string[] | null): boolean {
  if (!grades || grades.length === 0) return true;
  if (!grade?.trim()) return true;
  const needle = normalize(grade);
  const needleNums = parseGradeNumbers(grade);
  return grades.some((item) => {
    const hay = normalize(item);
    if (!hay) return false;
    if (hay === needle) return true;
    const hayNums = parseGradeNumbers(item);
    if (needleNums.length > 0 && hayNums.length > 0) {
      return needleNums.some((num) => hayNums.includes(num));
    }
    return false;
  });
}

export function isGraduateLevelOpportunity(opportunity: OpportunityInput): boolean {
  const text = [opportunity.title, opportunity.eligibility, opportunity.field, opportunity.description]
    .filter(Boolean)
    .join(" ");
  return GRADUATE_LEVEL.test(text);
}

export function isSchoolStudent(profile: OpportunityProfile): boolean {
  if (profile.path === "transfer") return false;
  if (profile.path === "graduate") return true;
  return parseGradeNumbers(profile.grade_or_year).some((grade) => grade >= 9 && grade <= 12);
}

function pathAllowed(profile: OpportunityProfile, opportunity: OpportunityInput): boolean {
  if (isGraduateLevelOpportunity(opportunity) && isSchoolStudent(profile)) return false;
  if (opportunity.grades && opportunity.grades.length > 0) return true;
  if (!profile.path || !opportunity.eligibility) return true;
  const text = opportunity.eligibility.toLocaleLowerCase("ru");
  const school = /high school|школ|класс|9\s*[-–]\s*12/.test(text);
  const university = /transfer|undergraduate|курс|студент/.test(text);
  if (profile.path === "graduate" && university && !school) return false;
  if (profile.path === "transfer" && school && !university) return false;
  return true;
}

export function opportunityReasons(
  profile: OpportunityProfile,
  opportunity: OpportunityInput,
  today: Date | string = new Date(),
): string[] {
  const reasons: string[] = [];
  const day = toUtcDateString(today);
  if (opportunity.grades && opportunity.grades.length > 0) {
    if (profile.grade_or_year && gradeMatches(profile.grade_or_year, opportunity.grades)) {
      reasons.push(`Подходит по классу: ${profile.grade_or_year}`);
    }
  } else if (!(isGraduateLevelOpportunity(opportunity) && isSchoolStudent(profile))) {
    reasons.push("Нет ограничения по классу");
  }
  if (isFreeCost(opportunity.cost) === true) reasons.push("Бесплатно");
  const deadline = opportunity.deadline?.slice(0, 10);
  if (deadline && deadline >= day) reasons.push("Дедлайн ещё открыт");
  if (opportunity.format && opportunity.format !== "unknown") {
    reasons.push(opportunity.format);
  }
  return reasons;
}

export function matchOpportunities<T extends OpportunityInput>(
  profile: OpportunityProfile,
  opportunities: T[],
  filters: OpportunityFilters = {},
  today: Date | string = new Date(),
): T[] {
  const day = toUtcDateString(today);
  const type = filters.type?.trim();
  const format = filters.format?.trim();

  return opportunities
    .filter((opportunity) => {
      if (type && opportunity.type !== type) return false;
      if (format && opportunity.format !== format) return false;
      if (!gradeMatches(profile.grade_or_year, opportunity.grades)) return false;
      if (!pathAllowed(profile, opportunity)) return false;
      if (filters.freeOnly && isFreeCost(opportunity.cost) !== true) return false;
      if (filters.upcomingOnly && opportunity.deadline && opportunity.deadline.slice(0, 10) < day) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      const aDate = a.deadline?.slice(0, 10) ?? "";
      const bDate = b.deadline?.slice(0, 10) ?? "";
      const aUpcoming = aDate && aDate >= day;
      const bUpcoming = bDate && bDate >= day;
      if (aUpcoming && bUpcoming && aDate !== bDate) return aDate.localeCompare(bDate);
      if (aUpcoming && !bUpcoming) return -1;
      if (!aUpcoming && bUpcoming) return 1;
      if (aDate && bDate && aDate !== bDate) return aDate.localeCompare(bDate);
      if (aDate && !bDate) return -1;
      if (!aDate && bDate) return 1;
      return a.title.localeCompare(b.title, "ru");
    });
}
