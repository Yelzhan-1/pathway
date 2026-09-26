import type {
  CheckChancesOptions,
  CountryCode,
  DashboardData,
  DeadlineTicket,
  DocItem,
  DocStatus,
  Opportunity,
  OpportunityKind,
  RoadStep,
  StatTile,
  StreakData,
  UniCard,
} from "@/types/pathway";
import { classifyDeadlines } from "@/lib/matching/deadlines";
import { displayTitle, roundLabel } from "@/lib/labels/display";
import { displayMajor, uniqueDisplayMajors } from "@/lib/matching/synonyms";
import { shiftUtcDays, utcWeekRange } from "@/lib/matching/dates";
import type { FitCategory, FitUniversity } from "@/lib/matching/types";
import type { ProgressReport } from "@/lib/progress/readiness";
import { dayMonth, plural, initials } from "@/lib/format";
import {
  computeProfileCompleteness,
  PROFILE_COMPLETENESS_WEIGHTS,
  type CompletenessField,
} from "@/lib/profile/completeness";
import { getCountryLabel, type ProfileData } from "@/lib/profile/types";
import { strings } from "@/lib/strings";

const COUNTRY_CODES: Record<string, CountryCode> = {
  Kazakhstan: "KZ",
  KZ: "KZ",
  USA: "US",
  "United States": "US",
  US: "US",
  Germany: "DE",
  DE: "DE",
  Turkey: "TR",
  Türkiye: "TR",
  TR: "TR",
  "South Korea": "KR",
  Korea: "KR",
  KR: "KR",
  Netherlands: "NL",
  "The Netherlands": "NL",
  NL: "NL",
  UK: "GB",
  "United Kingdom": "GB",
  GB: "GB",
  Switzerland: "CH",
  CH: "CH",
  Japan: "JP",
  JP: "JP",
  China: "CN",
  CN: "CN",
  Singapore: "SG",
  SG: "SG",
  "Hong Kong SAR, China": "HK",
  "Hong Kong": "HK",
  HK: "HK",
  UAE: "AE",
  "United Arab Emirates": "AE",
  AE: "AE",
  Austria: "AT",
  AT: "AT",
  "Czech Republic": "CZ",
  Czechia: "CZ",
  CZ: "CZ",
  Italy: "IT",
  IT: "IT",
  Hungary: "HU",
  HU: "HU",
  Poland: "PL",
  PL: "PL",
  Malaysia: "MY",
  MY: "MY",
  Canada: "CA",
  CA: "CA",
};

const MISSING_LABEL: Record<CompletenessField, string> = {
  full_name: strings.profile.fields.fullName,
  path: strings.profile.fields.path,
  grade_or_year: strings.profile.fields.grade,
  city: strings.profile.fields.city,
  intended_major: strings.profile.fields.major,
  target_countries: strings.profile.fields.countries,
  budget: strings.profile.fields.budget,
  english_level: strings.profile.fields.english,
  exams: strings.profile.fields.exams,
  gpa: strings.profile.fields.gpa,
  intake_year: strings.profile.fields.intakeYear,
};

export function firstName(fullName: string | null, email: string | null): string {
  const source = fullName?.trim() || email?.split("@")[0] || "";
  return source.split(/\s+/)[0] || source;
}

export function displayName(fullName: string | null, email: string | null): string {
  return fullName?.trim() || email || "";
}

function cvBuckets(profile: ProfileData): boolean[] {
  const cv = profile.cv;
  return [
    cv.summary.trim().length > 0,
    cv.skills.some((item) => item.trim().length > 0),
    cv.languages.some((item) => item.name.trim().length > 0),
    cv.education.institution.trim().length > 0,
    cv.contacts.phone.trim().length > 0,
    cv.contacts.links.some((item) => item.label.trim().length > 0 || item.url.trim().length > 0),
    profile.activities.some((item) => item.title.trim().length > 0),
  ];
}

export function cvStarted(profile: ProfileData): boolean {
  return cvBuckets(profile).some(Boolean);
}

function cvDocStatus(profile: ProfileData): DocStatus {
  const filled = cvBuckets(profile).filter(Boolean).length;
  if (filled === 0) return "todo";
  if (filled >= 4) return "done";
  return "progress";
}

/** Profile ≥80% → done. CV with any real content → done. Shortlist count drives «Выбери вузы». */
export function roadSteps(input: {
  percent: number;
  cvStarted: boolean;
  shortlistCount: number | null;
}): RoadStep[] {
  const profileDone = input.percent >= 80;
  const cvDone = profileDone && input.cvStarted;
  const shortlistCount = input.shortlistCount;
  const unisDone = shortlistCount != null && shortlistCount > 0;

  let unisStatus: RoadStep["status"] = "locked";
  if (unisDone) unisStatus = "done";
  else if (cvDone && shortlistCount != null) unisStatus = "current";

  return [
    {
      id: "profile",
      title: "Профиль",
      status: profileDone ? "done" : "current",
      href: "/profile",
    },
    {
      id: "cv",
      title: "Резюме",
      status: !profileDone ? "locked" : input.cvStarted ? "done" : "current",
      href: "/cv",
    },
    {
      id: "unis",
      title: "Выбери вузы",
      status: unisStatus,
      href: "/universities",
    },
    { id: "exams", title: "Экзамены", status: unisDone ? "current" : "locked", href: "/exams" },
    { id: "apply", title: "Заявки", status: "locked" },
  ];
}

export function dashboardHeadline(input: {
  percent: number;
  cvStarted: boolean;
  shortlistCount: number | null;
}): string {
  if (input.percent < 80) return strings.dashboard.headlineProfile;
  if (!input.cvStarted) return strings.dashboard.headlineCv;
  if (input.shortlistCount === 0) return strings.dashboard.headlineUnis;
  return strings.dashboard.headlineNext;
}

export function toCountryCode(country: string): string {
  return COUNTRY_CODES[country] ?? country;
}

export type UniversityRow = {
  id: string;
  slug: string;
  name: string;
  country: string;
  city: string | null;
  majors: string[] | null;
};

export function toUniCards(rows: UniversityRow[], savedIds: Set<string> = new Set()): UniCard[] {
  return rows.map((row) => {
    const tags = uniqueDisplayMajors((row.majors ?? []).filter(Boolean)).slice(0, 2);
    return {
      id: row.id,
      name: row.name,
      monogram: initials(row.name),
      city: row.city?.trim() || getCountryLabel(row.country),
      country: toCountryCode(row.country),
      tags: tags.length > 0 ? tags : [getCountryLabel(row.country)],
      saved: savedIds.has(row.id),
      href: `/universities/${row.slug}`,
    };
  });
}

function docsFor(profile: ProfileData): DocItem[] {
  const status = cvDocStatus(profile);
  const docs: DocItem[] = [
    {
      id: "cv",
      title: "Резюме",
      status,
      href: "/cv",
      meta: status === "done" ? "заполнено" : status === "progress" ? "черновик" : "не начато",
    },
    { id: "transcript", title: "Транскрипт", status: "todo" },
  ];

  const planned = new Set(
    profile.exams
      .filter((exam) => exam.status === "planned" && (exam.code === "IELTS" || exam.code === "TOEFL_IBT"))
      .map((exam) => exam.code),
  );
  if (planned.has("IELTS")) docs.push({ id: "english", title: "IELTS", status: "todo" });
  if (planned.has("TOEFL_IBT")) docs.push({ id: "toefl", title: "TOEFL iBT", status: "todo" });

  const abroad = profile.target_countries.some(
    (country) => country !== "Kazakhstan" && country !== "KZ",
  );
  if (abroad) docs.push({ id: "motivation", title: "Мотив. письмо", status: "todo" });

  return docs;
}

const WEEKDAY_LABELS = ["пн", "вт", "ср", "чт", "пт", "сб", "вс"];

export function streakWeek(activityDays: string[], today: string): StreakData["week"] {
  const set = new Set(activityDays.map((day) => day.slice(0, 10)));
  const { start } = utcWeekRange(today);
  return Array.from({ length: 7 }, (_, index) => {
    const day = shiftUtcDays(start, index);
    if (day > today) return "todo";
    if (day === today) return set.has(day) ? "done" : "today";
    return set.has(day) ? "done" : "todo";
  });
}

function asCountry(code: string): CountryCode | undefined {
  const value = toCountryCode(code);
  return value.length === 2 ? (value as CountryCode) : undefined;
}

function checkOptionsFrom(rows: UniversityRow[], profile: ProfileData): CheckChancesOptions {
  const programs = new Map<string, { value: string; label: string }>();
  const countries = new Map<string, { value: string; label: string; country?: CountryCode }>();
  const universities = rows.map((row) => ({
    value: row.slug,
    label: row.name,
    country: asCountry(row.country),
    countryKey: row.country,
    majors: (row.majors ?? []).filter(Boolean),
  }));
  for (const row of rows) {
    countries.set(row.country, {
      value: row.country,
      label: getCountryLabel(row.country),
      country: asCountry(row.country),
    });
    for (const major of row.majors ?? []) {
      const label = displayMajor(major.trim());
      if (label) programs.set(label, { value: label, label });
    }
  }
  if (profile.intended_major?.trim()) {
    programs.set(profile.intended_major, {
      value: profile.intended_major,
      label: profile.intended_major,
    });
  }
  const byLabel = (a: { label: string }, b: { label: string }) => a.label.localeCompare(b.label, "ru");
  return {
    programs: [...programs.values()].sort(byLabel),
    countries: [...countries.values()].sort(byLabel),
    universities: universities.sort(byLabel),
    defaults: {
      program: profile.intended_major ?? undefined,
      country: profile.target_countries[0],
    },
  };
}

function opportunityKind(type: string): OpportunityKind {
  if (type === "olympiad") return "olympiad";
  if (type === "scholarship") return "grant";
  if (type === "competition") return "contest";
  return "program";
}

function presentOpportunities(
  rows: Array<{
    id: string;
    type: string;
    title: string;
    deadline: string | null;
    url: string | null;
    source_url: string;
  }>,
): Opportunity[] {
  return rows.slice(0, 3).map((row) => {
    const typeLabel =
      row.type in strings.opportunities.types
        ? strings.opportunities.types[row.type as keyof typeof strings.opportunities.types]
        : row.type;
    return {
      id: row.id,
      kind: opportunityKind(row.type),
      title: displayTitle(row.title),
      meta: row.deadline ? `${typeLabel} · ${dayMonth(row.deadline.slice(0, 10))}` : typeLabel,
      href: row.url || row.source_url,
    };
  });
}

function presentDeadlines(
  items: Array<{ university: Pick<FitUniversity, "id" | "slug" | "name" | "deadlines"> }>,
  today: string,
): DeadlineTicket[] {
  const tickets: DeadlineTicket[] = [];
  for (const item of items) {
    for (const entry of classifyDeadlines(item.university.deadlines, today).upcoming) {
      tickets.push({
        id: `${item.university.id}-${entry.round}-${entry.date}`,
        title: `${item.university.name} · ${roundLabel(entry.round)}`,
        date: entry.date,
        href: `/universities/${item.university.slug}`,
      });
    }
  }
  return tickets.sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5);
}

export function presentDashboard(input: {
  today: string;
  profile: ProfileData;
  email: string | null;
  shortlistCount: number | null;
  universities: UniversityRow[] | null;
  universityTotal: number | null;
  shortlistItems?: Array<{
    category: FitCategory;
    university: Pick<FitUniversity, "id" | "slug" | "name" | "deadlines">;
  }> | null;
  opportunities?: Array<{
    id: string;
    type: string;
    title: string;
    deadline: string | null;
    url: string | null;
    source_url: string;
  }> | null;
  activityDays?: string[] | null;
  progress?: ProgressReport | null;
}): DashboardData {
  const completeness = computeProfileCompleteness(input.profile);
  const started = cvStarted(input.profile);
  const missing = completeness.missing.map((item) => ({
    id: item.field,
    label: MISSING_LABEL[item.field],
    gain: PROFILE_COMPLETENESS_WEIGHTS[item.field],
    href: `/profile#${item.field}`,
  }));
  const gap = plural(missing.length, "поле", "поля", "полей");
  const savedIds = new Set((input.shortlistItems ?? []).map((item) => item.university.id));
  const catalog = input.universities ?? [];
  const shortlist = input.shortlistItems ?? [];
  const chancesTotal = shortlist.length;
  const stats: StatTile[] | null =
    input.shortlistCount == null
      ? null
      : [
          {
            id: "favorites",
            label: strings.dashboard.favoritesTile,
            value: input.shortlistCount,
            href: "/favorites",
          },
        ];
  const weekly = input.progress?.weeklyGoal;
  const streak: StreakData | null = input.progress
    ? {
        days: input.progress.streak ?? 0,
        week: streakWeek(input.activityDays ?? [], input.today),
        weekdayLabels: WEEKDAY_LABELS,
        quest:
          weekly?.goal != null
            ? { title: strings.dashboard.quest, done: weekly.done, total: weekly.goal }
            : null,
      }
    : null;

  return {
    today: input.today,
    firstName: firstName(input.profile.full_name, input.email),
    headline: dashboardHeadline({
      percent: completeness.percent,
      cvStarted: started,
      shortlistCount: input.shortlistCount,
    }),
    road: roadSteps({
      percent: completeness.percent,
      cvStarted: started,
      shortlistCount: input.shortlistCount,
    }),
    roadFinish: completeness.percent >= 80 ? "Финиш · подача заявок" : null,
    stats,
    strength: {
      percent: completeness.percent,
      levelLabel: missing.length
        ? strings.dashboard.levelGap(`${missing.length} ${gap}`)
        : strings.dashboard.levelReady,
      missing,
    },
    streak,
    popular: catalog.length > 0 ? toUniCards(catalog.slice(0, 3), savedIds) : null,
    popularTotal: input.universityTotal ?? undefined,
    checkOptions: catalog.length > 0 ? checkOptionsFrom(catalog, input.profile) : null,
    chances: chancesTotal
      ? {
          dream: shortlist.filter((item) => item.category === "dream").length,
          target: shortlist.filter((item) => item.category === "target").length,
          safety: shortlist.filter((item) => item.category === "safety").length,
          href: "/favorites",
        }
      : null,
    deadlines: shortlist.length > 0 ? presentDeadlines(shortlist, input.today) : null,
    opportunities: input.opportunities?.length ? presentOpportunities(input.opportunities) : null,
    docs: docsFor(input.profile),
    ai: {
      message: strings.dashboard.aiMessage,
      primary: { label: strings.dashboard.aiCta, href: "/assistant" },
      secondary: { label: strings.dashboard.aiTasks, href: "/tasks" },
    },
    weeklyGoal: input.progress?.weeklyGoal.goal ?? null,
    progress: input.progress
      ? {
          readinessPercent: input.progress.readiness.percent,
          parts: Object.values(input.progress.readiness.parts).map((part) => ({
            key: part.key,
            label: part.label_ru,
            percent: part.percent,
          })),
          achievements: input.progress.achievements.map((item) => ({
            id: item.id,
            title: item.title_ru,
            unlocked: item.unlocked,
          })),
          weeklyGoal: input.progress.weeklyGoal,
        }
      : null,
  };
}

export function todayInAlmaty(now: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Almaty" }).format(now);
}
