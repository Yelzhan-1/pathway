import type { CountryCode, DashboardData, DocItem, DocStatus, RoadStep, UniCard } from "@/types/pathway";
import { plural, initials } from "@/lib/format";
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
  const unisDone = cvDone && shortlistCount != null && shortlistCount > 0;

  let unisStatus: RoadStep["status"] = "locked";
  if (cvDone && shortlistCount != null) unisStatus = unisDone ? "done" : "current";

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
    { id: "exams", title: "Экзамены", status: "locked", href: "/exams" },
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
  name: string;
  country: string;
  city: string | null;
  majors: string[] | null;
};

export function toUniCards(rows: UniversityRow[]): UniCard[] {
  return rows.map((row) => {
    const tags = (row.majors ?? []).filter(Boolean).slice(0, 2);
    return {
      id: row.id,
      name: row.name,
      monogram: initials(row.name),
      city: row.city?.trim() || getCountryLabel(row.country),
      country: toCountryCode(row.country),
      tags: tags.length > 0 ? tags : [getCountryLabel(row.country)],
      saved: false,
      href: `/universities?q=${encodeURIComponent(row.name)}`,
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
  if (planned.has("TOEFL_IBT")) docs.push({ id: "toefl", title: "TOEFL", status: "todo" });

  const abroad = profile.target_countries.some(
    (country) => country !== "Kazakhstan" && country !== "KZ",
  );
  if (abroad) docs.push({ id: "motivation", title: "Мотив. письмо", status: "todo" });

  return docs;
}

export function presentDashboard(input: {
  today: string;
  profile: ProfileData;
  email: string | null;
  shortlistCount: number | null;
  universities: UniversityRow[] | null;
  universityTotal: number | null;
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
    stats: null,
    strength: {
      percent: completeness.percent,
      levelLabel: missing.length
        ? strings.dashboard.levelGap(`${missing.length} ${gap}`)
        : strings.dashboard.levelReady,
      missing,
    },
    streak: null,
    popular: input.universities && input.universities.length > 0 ? toUniCards(input.universities) : null,
    popularTotal: input.universityTotal ?? undefined,
    checkOptions: null,
    chances: null,
    deadlines: null,
    opportunities: null,
    docs: docsFor(input.profile),
    ai: null,
  };
}

export function todayInAlmaty(now: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Almaty" }).format(now);
}
