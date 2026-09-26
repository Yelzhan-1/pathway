import { isFreeOrGrantUniversity, isGrantAid } from "./budget";
import { classifyDeadlines, LAST_CYCLE_WARNING_RU } from "./deadlines";
import { gpaRatio, universityGpaMinRatio } from "./gpa";
import { majorMatches, uniqueDisplayMajors, universityMatchesQuery } from "./synonyms";
import { aidLabel, examLabel, formatMoneyUsd, roundLabel } from "@/lib/labels/display";
import { getCountryLabel } from "@/lib/profile/types";
import { coerceFinite } from "@/data/catalog-acceptance";
import {
  SCORED_FIT_KEYS,
  type FitCategory,
  type FitCheck,
  type FitCheckKey,
  type FitGap,
  type FitProfile,
  type FitResult,
  type FitUniversity,
  type ScoredFitKey,
  type UniversityFilters,
} from "./types";

export { majorMatches } from "./synonyms";

const PROFILE_GAP_RU: Record<ScoredFitKey | "country", string> = {
  english: "добавьте результат IELTS, TOEFL или Duolingo",
  unt: "добавьте результат ЕНТ",
  sat: "добавьте результат SAT",
  gpa: "добавьте GPA",
  budget: "добавьте бюджет",
  major: "добавьте специальность",
  country: "добавьте страны",
};

type BuiltCheck = {
  check: FitCheck;
  gap: FitGap | null;
};

function formatNumber(value: number, decimals?: number): string {
  const rounded = Math.round(value * 10) / 10;
  if (decimals === 1) return rounded.toFixed(1);
  return Number.isInteger(rounded) ? String(rounded) : String(rounded);
}

function formatExamScore(label: string, value: number): string {
  if (label === "IELTS") return formatNumber(value, 1);
  return formatNumber(value);
}

function normalize(value: string): string {
  return value.trim().toLocaleLowerCase("ru").replace(/\s+/g, " ");
}

function takenScore(profile: FitProfile, code: string): number | null {
  const scores = profile.exams
    .filter(
      (exam) =>
        exam.code === code &&
        exam.status === "taken" &&
        typeof exam.score === "number" &&
        Number.isFinite(exam.score),
    )
    .map((exam) => exam.score as number);
  if (scores.length === 0) return null;
  return Math.max(...scores);
}

function check(partial: BuiltCheck): BuiltCheck {
  return partial;
}

function englishCheck(profile: FitProfile, university: FitUniversity): BuiltCheck {
  const options = [
    { code: "IELTS", label: examLabel("IELTS"), min: university.ielts_min },
    { code: "TOEFL_IBT", label: examLabel("TOEFL_IBT"), min: university.toefl_min },
    { code: "DET", label: examLabel("DET"), min: university.duolingo_min },
  ].filter((option) => option.min != null);

  if (options.length === 0) {
    return check({
      check: {
        key: "english",
        status: "unknown",
        have: null,
        need: null,
        sourceUrl: university.source_url,
      },
      gap: null,
    });
  }

  const evaluated = options.map((option) => ({
    ...option,
    score: takenScore(profile, option.code),
  }));
  const passing = evaluated.find(
    (option) => option.score != null && option.min != null && option.score >= option.min,
  );
  const need = evaluated
    .map((option) => `${option.label} ${formatNumber(option.min as number)}`)
    .join(" / ");

  if (passing) {
    return check({
      check: {
        key: "english",
        status: "meets",
        have: `${passing.label} ${formatNumber(passing.score as number)}`,
        need,
        sourceUrl: university.source_url,
      },
      gap: null,
    });
  }

  const taken = evaluated.filter((option) => option.score != null);
  const below = taken.filter(
    (option) => option.min != null && option.score != null && option.score < option.min,
  );
  if (below.length > 0) {
    const closest = below.slice().sort((a, b) => {
      const aGap = (a.min as number) - (a.score as number);
      const bGap = (b.min as number) - (b.score as number);
      return aGap - bGap;
    })[0]!;
    const raise = `поднять ${closest.label} до ${formatExamScore(closest.label, closest.min as number)}`;
    return check({
      check: {
        key: "english",
        status: "below",
        have: taken
          .map((option) => `${option.label} ${formatNumber(option.score as number)}`)
          .join(", "),
        need,
        sourceUrl: university.source_url,
      },
      gap: {
        key: "english",
        message_ru: raise,
        delta: raise,
      },
    });
  }

  return check({
    check: {
      key: "english",
      status: "unknown",
      have: taken.length
        ? taken
            .map((option) => `${option.label} ${formatNumber(option.score as number)}`)
            .join(", ")
        : null,
      need,
      sourceUrl: university.source_url,
    },
    gap: {
      key: "english",
      message_ru: PROFILE_GAP_RU.english,
      delta: null,
    },
  });
}

function untCheck(profile: FitProfile, university: FitUniversity): BuiltCheck {
  if (university.unt_min == null) {
    return check({
      check: {
        key: "unt",
        status: "unknown",
        have: null,
        need: null,
        sourceUrl: university.source_url,
      },
      gap: null,
    });
  }
  const score = takenScore(profile, "UNT");
  const need = `ЕНТ ${formatNumber(university.unt_min)}`;
  if (score == null) {
    return check({
      check: {
        key: "unt",
        status: "unknown",
        have: null,
        need,
        sourceUrl: university.source_url,
      },
      gap: { key: "unt", message_ru: PROFILE_GAP_RU.unt, delta: null },
    });
  }
  const meets = score >= university.unt_min;
  return check({
    check: {
      key: "unt",
      status: meets ? "meets" : "below",
      have: `ЕНТ ${formatNumber(score)}`,
      need,
      sourceUrl: university.source_url,
    },
    gap: meets
      ? null
      : {
          key: "unt",
          message_ru: "ЕНТ ниже требования",
          delta: `${formatNumber(score)} < ${formatNumber(university.unt_min)}`,
        },
  });
}

const SAT_TOTAL_MIN = 1000;
const SAT_TOTAL_MAX = 1600;

/** First total SAT in free text: a 1000–1600 range such as "1500-1570", else a single total. Section scores (200–800) are ignored. */
function satTotalFromText(value: string): number | null {
  const rangeRe = /(\d{3,4})\s*[-–—]\s*(\d{3,4})/g;
  for (const match of value.matchAll(rangeRe)) {
    const low = Number(match[1]);
    const high = Number(match[2]);
    if (low >= SAT_TOTAL_MIN && low <= SAT_TOTAL_MAX && high >= low && high <= SAT_TOTAL_MAX) return low;
  }
  const numberRe = /\d{3,4}/g;
  for (const match of value.matchAll(numberRe)) {
    const score = Number(match[0]);
    if (score >= SAT_TOTAL_MIN && score <= SAT_TOTAL_MAX) return score;
  }
  return null;
}

/** Lowest published SAT bar: explicit minimum, otherwise the low end of a total middle-50 range. */
export function publishedSatMin(university: FitUniversity): number | null {
  if (typeof university.sat_total_min === "number" && Number.isFinite(university.sat_total_min)) {
    return university.sat_total_min;
  }
  const middle = university.sat_middle_50;
  if (!middle) return null;
  return satTotalFromText(middle);
}

function satCheck(profile: FitProfile, university: FitUniversity): BuiltCheck {
  const policy = university.sat_policy;
  const score = takenScore(profile, "SAT");
  const satMin = publishedSatMin(university);
  const sourceUrl = university.source_url;

  if (policy === "not_used") {
    return check({
      check: { key: "sat", status: "not_required", have: score == null ? null : `SAT ${formatNumber(score)}`, need: "не используется", sourceUrl },
      gap: null,
    });
  }

  if (policy === "optional" && score == null) {
    return check({
      check: { key: "sat", status: "not_required", have: null, need: "необязательно", sourceUrl },
      gap: null,
    });
  }

  if (policy !== "required" && policy !== "optional") {
    return check({
      check: { key: "sat", status: "unknown", have: score == null ? null : `SAT ${formatNumber(score)}`, need: null, sourceUrl },
      gap: null,
    });
  }

  if (satMin == null) {
    return check({
      check: {
        key: "sat",
        status: "unknown",
        have: score == null ? null : `SAT ${formatNumber(score)}`,
        need: null,
        sourceUrl,
      },
      gap: score == null && policy === "required"
        ? { key: "sat", message_ru: PROFILE_GAP_RU.sat, delta: null }
        : null,
    });
  }

  const need = `SAT ${formatNumber(satMin)}`;
  if (score == null) {
    return check({
      check: { key: "sat", status: "unknown", have: null, need, sourceUrl },
      gap: { key: "sat", message_ru: PROFILE_GAP_RU.sat, delta: null },
    });
  }
  const meets = score >= satMin;
  return check({
    check: {
      key: "sat",
      status: meets ? "meets" : "below",
      have: `SAT ${formatNumber(score)}`,
      need,
      sourceUrl,
    },
    gap: meets
      ? null
      : {
          key: "sat",
          message_ru: "SAT ниже требования",
          delta: `${formatNumber(score)} < ${formatNumber(satMin)}`,
        },
  });
}

function gpaCheck(profile: FitProfile, university: FitUniversity): BuiltCheck {
  const minRatio = universityGpaMinRatio(university.requirements);
  const ratio = gpaRatio(profile.gpa, profile.gpa_scale);
  const have =
    profile.gpa != null && profile.gpa_scale != null
      ? `${formatNumber(profile.gpa)}/${formatNumber(profile.gpa_scale)}`
      : null;
  if (minRatio == null) {
    return check({
      check: {
        key: "gpa",
        status: "unknown",
        have,
        need: null,
        sourceUrl: university.source_url,
      },
      gap: null,
    });
  }
  const need = `GPA ≥ ${minRatio.toFixed(2)}`;
  if (ratio == null) {
    return check({
      check: { key: "gpa", status: "unknown", have, need, sourceUrl: university.source_url },
      gap: { key: "gpa", message_ru: PROFILE_GAP_RU.gpa, delta: null },
    });
  }
  const meets = ratio >= minRatio;
  return check({
    check: {
      key: "gpa",
      status: meets ? "meets" : "below",
      have: `${have} (${ratio.toFixed(2)})`,
      need,
      sourceUrl: university.source_url,
    },
    gap: meets
      ? null
      : {
          key: "gpa",
          message_ru: "GPA ниже требования",
          delta: `${ratio.toFixed(2)} < ${minRatio.toFixed(2)}`,
        },
  });
}

function budgetCheck(profile: FitProfile, university: FitUniversity): BuiltCheck {
  const tuition = university.tuition_usd_per_year;
  const aid = university.aid_for_internationals;
  const sourceUrl = university.source_url;
  if (tuition == null) {
    return check({
      check: { key: "budget", status: "unknown", have: profile.budget_usd == null ? null : formatMoneyUsd(profile.budget_usd), need: null, sourceUrl },
      gap: profile.budget_usd == null
        ? { key: "budget", message_ru: PROFILE_GAP_RU.budget, delta: null }
        : null,
    });
  }
  const aidText = aidLabel(aid);
  const need = `обучение ${formatMoneyUsd(tuition)}${aidText ? `, помощь: ${aidText}` : ""}`;
  if (profile.budget_usd == null) {
    return check({
      check: { key: "budget", status: "unknown", have: null, need, sourceUrl },
      gap: { key: "budget", message_ru: PROFILE_GAP_RU.budget, delta: null },
    });
  }
  const have = `${formatMoneyUsd(profile.budget_usd)}${profile.needs_scholarship ? ", нужна стипендия" : ""}`;
  if (tuition <= profile.budget_usd) {
    return check({
      check: { key: "budget", status: "meets", have, need, sourceUrl },
      gap: null,
    });
  }
  if (profile.needs_scholarship && isGrantAid(aid)) {
    return check({
      check: { key: "budget", status: "meets", have, need, sourceUrl },
      gap: null,
    });
  }
  if (profile.needs_scholarship && (aid == null || aid === "unknown")) {
    return check({
      check: { key: "budget", status: "unknown", have, need, sourceUrl },
      gap: null,
    });
  }
  const delta = formatMoneyUsd(tuition - profile.budget_usd);
  return check({
    check: { key: "budget", status: "below", have, need, sourceUrl },
    gap: {
      key: "budget",
      message_ru: "бюджет ниже стоимости обучения",
      delta,
    },
  });
}

function majorCheck(profile: FitProfile, university: FitUniversity): BuiltCheck {
  const majors = university.majors?.filter((major) => major.trim()) ?? [];
  if (majors.length === 0) {
    return check({
      check: {
        key: "major",
        status: "unknown",
        have: profile.intended_major,
        need: null,
        sourceUrl: university.source_url,
      },
      gap: profile.intended_major
        ? null
        : { key: "major", message_ru: PROFILE_GAP_RU.major, delta: null },
    });
  }
  if (!profile.intended_major?.trim()) {
    return check({
      check: {
        key: "major",
        status: "unknown",
        have: null,
        need: uniqueDisplayMajors(majors).join(", "),
        sourceUrl: university.source_url,
      },
      gap: { key: "major", message_ru: PROFILE_GAP_RU.major, delta: null },
    });
  }
  const meets = majorMatches(profile.intended_major, majors);
  return check({
    check: {
      key: "major",
      status: meets ? "meets" : "below",
      have: profile.intended_major,
      need: uniqueDisplayMajors(majors).join(", "),
      sourceUrl: university.source_url,
    },
    gap: meets
      ? null
      : {
          key: "major",
          message_ru: "специальность не найдена в списке вуза",
          delta: null,
        },
  });
}

function countryCheck(profile: FitProfile, university: FitUniversity): BuiltCheck {
  const countries = profile.target_countries.map((country) => country.trim()).filter(Boolean);
  if (countries.length === 0) {
    return check({
      check: {
        key: "country",
        status: "unknown",
        have: null,
        need: getCountryLabel(university.country),
        sourceUrl: university.source_url,
      },
      gap: { key: "country", message_ru: PROFILE_GAP_RU.country, delta: null },
    });
  }
  const meets = countries.some(
    (country) => normalize(country) === normalize(university.country),
  );
  return check({
    check: {
      key: "country",
      status: meets ? "meets" : "below",
      have: countries.map(getCountryLabel).join(", "),
      need: getCountryLabel(university.country),
      sourceUrl: university.source_url,
    },
    gap: null,
  });
}

function deadlineCheck(university: FitUniversity, today: string): BuiltCheck {
  const classified = classifyDeadlines(university.deadlines, today);
  const sourceUrl = university.source_url;
  if (classified.upcoming.length > 0) {
    const next = classified.upcoming[0]!;
    return check({
      check: {
        key: "deadline",
        status: "meets",
        have: `${roundLabel(next.round)}: ${next.date}`,
        need: next.date,
        sourceUrl,
      },
      gap: null,
    });
  }
  if (classified.expired.length > 0) {
    const past = classified.expired[0]!;
    return check({
      check: {
        key: "deadline",
        status: "below",
        have: `${roundLabel(past.round)}: ${past.date}`,
        need: past.date,
        sourceUrl,
      },
      gap: null,
    });
  }
  if (classified.lastCycle.length > 0) {
    const stale = classified.lastCycle[0]!;
    return check({
      check: {
        key: "deadline",
        status: "unknown",
        have: `${roundLabel(stale.round)}: ${stale.date}`,
        need: LAST_CYCLE_WARNING_RU,
        sourceUrl,
      },
      gap: null,
    });
  }
  return check({
    check: {
      key: "deadline",
      status: "unknown",
      have: null,
      need: null,
      sourceUrl,
    },
    gap: null,
  });
}

/** Values ≤ 1 are fractions; values above 1 are percents. Numeric strings from Postgres are accepted. */
export function acceptanceFraction(acceptanceRate: unknown): number | null {
  const rate = coerceFinite(acceptanceRate);
  if (rate == null || rate < 0) return null;
  if (rate <= 1) return rate;
  return rate / 100;
}

/** Selective means 15% or under. */
export function isVerySelective(acceptanceRate: number | null): boolean {
  const fraction = acceptanceFraction(acceptanceRate);
  return fraction != null && fraction <= 0.15;
}

function flaggedHighlySelective(requirements: Record<string, unknown> | null): boolean {
  if (!requirements) return false;
  const flag = requirements.highly_selective ?? requirements.highlySelective;
  if (flag === true || flag === "true") return true;
  const selectivity = requirements.selectivity;
  return typeof selectivity === "string" && /highly|most\s+selective/i.test(selectivity);
}

const ACADEMIC_KEYS = ["english", "gpa", "sat"] as const;

function capCategory(
  category: FitCategory | null,
  acceptanceRate: number | null,
  requirements: Record<string, unknown> | null,
): FitCategory | null {
  if (!category) return null;
  const fraction = acceptanceFraction(acceptanceRate);
  const ceiling: FitCategory =
    flaggedHighlySelective(requirements) || (fraction != null && fraction <= 0.15)
      ? "dream"
      : fraction != null && fraction <= 0.3
        ? "target"
        : "safety";
  const rank = { dream: 0, target: 1, safety: 2 } as const;
  return rank[category] > rank[ceiling] ? ceiling : category;
}

function baseCategory(checks: FitCheck[]): FitCategory | null {
  const scored = new Set<string>(SCORED_FIT_KEYS);
  const scoredChecks = checks.filter((item) => scored.has(item.key));
  if (scoredChecks.some((item) => item.status === "below")) return "dream";
  if (scoredChecks.some((item) => item.status === "unknown" && item.need != null)) return "target";

  const academicMet = checks.some(
    (item) =>
      (ACADEMIC_KEYS as readonly string[]).includes(item.key) && item.status === "meets",
  );
  const budget = checks.find((item) => item.key === "budget");
  const major = checks.find((item) => item.key === "major");
  const budgetMajorOk =
    budget?.status !== "below" && major?.status !== "below";
  if (academicMet && budgetMajorOk) return "safety";

  const academicsUnpublished = ACADEMIC_KEYS.every((key) => {
    const item = checks.find((check) => check.key === key);
    return !item || item.status === "not_required" || (item.status === "unknown" && item.need == null);
  });
  if (budget?.status === "meets" && major?.status === "meets" && academicsUnpublished) {
    return "safety";
  }
  if (budget?.status === "meets" || major?.status === "meets" || academicMet) return "target";
  return null;
}

function fitScore(checks: FitCheck[]): number | null {
  const scored = new Set<string>(SCORED_FIT_KEYS);
  const comparable = checks.filter((item) => {
    if (!scored.has(item.key)) return false;
    if (item.status === "meets" || item.status === "below") return true;
    return item.status === "unknown" && item.need != null;
  });
  if (comparable.length === 0) return null;
  const total = comparable.reduce((sum, item) => sum + (item.status === "meets" ? 100 : 0), 0);
  let score = Math.round(total / comparable.length);
  const academicCompared = checks.some(
    (item) =>
      (ACADEMIC_KEYS as readonly string[]).includes(item.key) &&
      (item.status === "meets" || item.status === "below"),
  );
  if (!academicCompared) score = Math.min(score, 60);
  return score;
}

export function fitUniversity(
  profile: FitProfile,
  university: FitUniversity,
  today: Date | string = new Date(),
): FitResult {
  const day = typeof today === "string" ? today.slice(0, 10) : today.toISOString().slice(0, 10);
  const built = [
    englishCheck(profile, university),
    untCheck(profile, university),
    satCheck(profile, university),
    gpaCheck(profile, university),
    budgetCheck(profile, university),
    majorCheck(profile, university),
    countryCheck(profile, university),
    deadlineCheck(university, day),
  ];
  const checks = built.map((item) => item.check);
  const gaps = built.flatMap((item) => (item.gap ? [item.gap] : []));
  return {
    score: fitScore(checks),
    suggestedCategory: capCategory(
      baseCategory(checks),
      university.acceptance_rate,
      university.requirements,
    ),
    checks,
    gaps,
  };
}

function includesQuery(university: FitUniversity, query: string): boolean {
  return universityMatchesQuery(university, query);
}

export function rankUniversities(
  profile: FitProfile,
  universities: FitUniversity[],
  filters: UniversityFilters = {},
  today: Date | string = new Date(),
): Array<FitUniversity & { fit: FitResult }> {
  const region = filters.region?.trim();
  const country = filters.country?.trim();
  const major = filters.major?.trim();
  const query = filters.query?.trim();
  const satPolicy = filters.satPolicy?.trim();

  const matched = universities.filter((university) => {
    if (region && university.region !== region) return false;
    if (country && normalize(university.country) !== normalize(country)) return false;
    if (satPolicy && university.sat_policy !== satPolicy) return false;
    if (filters.maxTuition != null) {
      if (university.tuition_usd_per_year == null) return false;
      if (university.tuition_usd_per_year > filters.maxTuition) return false;
    }
    if (filters.freeOrGrantOnly && !isFreeOrGrantUniversity(university)) return false;
    if (major) {
      const majors = university.majors ?? [];
      if (!majorMatches(major, majors)) return false;
    }
    if (query && !includesQuery(university, query)) return false;
    return true;
  });

  return matched
    .map((university) => ({ ...university, fit: fitUniversity(profile, university, today) }))
    .sort((a, b) => {
      if (a.fit.score == null && b.fit.score == null) {
        return a.name.localeCompare(b.name, "ru");
      }
      if (a.fit.score == null) return 1;
      if (b.fit.score == null) return -1;
      if (a.fit.score !== b.fit.score) return b.fit.score - a.fit.score;
      return a.name.localeCompare(b.name, "ru");
    });
}

export function checkByKey(result: FitResult, key: FitCheckKey): FitCheck {
  const found = result.checks.find((item) => item.key === key);
  if (!found) throw new Error(`Missing fit check ${key}`);
  return found;
}
