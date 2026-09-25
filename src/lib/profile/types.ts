import type { ApplicantPath } from "@/lib/database.types";

import type { ALevelGrade, ExamCode } from "./exam-ranges";

export type ExamStatus = "taken" | "planned";

export type NumericExamEntry = {
  code: Exclude<ExamCode, "A_LEVEL">;
  score: number;
  date: string | null;
  status: ExamStatus;
  subject?: string | null;
};

export type ALevelExamEntry = {
  code: "A_LEVEL";
  score: ALevelGrade;
  date: string | null;
  status: ExamStatus;
  subject?: string | null;
};

export type ExamEntry = NumericExamEntry | ALevelExamEntry;

export const ACTIVITY_TYPES = [
  "olympiad",
  "project",
  "volunteer",
  "work",
  "sport",
  "arts",
  "other",
] as const;

export type ActivityType = (typeof ACTIVITY_TYPES)[number];

export type Activity = {
  id: string;
  type: ActivityType;
  title: string;
  role: string;
  organization: string;
  description: string;
  start_date: string | null;
  end_date: string | null;
  achievement: string;
};

export type CvLink = {
  label: string;
  url: string;
};

export type CvLanguage = {
  name: string;
  level: string;
};

export type CvContacts = {
  phone: string;
  city: string;
  links: CvLink[];
};

export type CvEducation = {
  institution: string;
};

export type CvHeadingsLang = "ru" | "en";

export type Cv = {
  summary: string;
  skills: string[];
  languages: CvLanguage[];
  contacts: CvContacts;
  education: CvEducation;
  headingsLang: CvHeadingsLang;
};

export const ENGLISH_LEVELS = [
  "none",
  "A1",
  "A2",
  "B1",
  "B2",
  "C1",
  "C2",
] as const;

export type EnglishLevel = (typeof ENGLISH_LEVELS)[number];

export const GPA_SCALES = [4, 5, 10, 100] as const;

export type GpaScale = (typeof GPA_SCALES)[number];

export const GRADUATE_GRADES = [
  "9 класс",
  "10 класс",
  "11 класс",
  "12 класс",
] as const;

export const TRANSFER_YEARS = [
  "1 курс",
  "2 курс",
  "3 курс",
  "4 курс",
] as const;

export const KZ_CITIES = [
  "Алматы",
  "Астана",
  "Шымкент",
  "Караганда",
  "Актобе",
  "Атырау",
  "Усть-Каменогорск",
  "Павлодар",
  "Тараз",
  "Костанай",
  "Кызылорда",
  "Семей",
  "Уральск",
  "Туркестан",
  "Петропавловск",
  "Актау",
] as const;

export const OTHER_CITY_VALUE = "Другой";

export const MAJOR_OPTIONS = [
  "Компьютерные науки",
  "Инженерия",
  "Медицина",
  "Бизнес и экономика",
  "Право",
  "Международные отношения",
  "Архитектура и дизайн",
  "Естественные науки",
  "Математика и статистика",
  "Психология",
  "Педагогика",
  "Журналистика и медиа",
  "Искусство",
] as const;

export const OTHER_MAJOR_VALUE = "Другое";

export const INTAKE_YEAR_MIN = 2025;
export const INTAKE_YEAR_MAX = 2035;

export const BUDGET_OPTIONS = [
  { value: 0, labelKey: "zero" as const },
  { value: 10000, labelKey: "upTo10k" as const },
  { value: 20000, labelKey: "from10to20" as const },
  { value: 40000, labelKey: "from20to40" as const },
  { value: 60000, labelKey: "from40to60" as const },
  { value: 100000, labelKey: "from60plus" as const },
] as const;

/**
 * Russian labels for catalog country values. `getCountryLabel` falls back
 * to the raw database value when a mapping is missing.
 */
export const COUNTRY_LABELS: Record<string, string> = {
  USA: "США",
  Kazakhstan: "Казахстан",
  UK: "Великобритания",
  Turkey: "Турция",
  China: "Китай",
  Netherlands: "Нидерланды",
  Germany: "Германия",
  "South Korea": "Южная Корея",
  "Hong Kong SAR, China": "Гонконг",
  Japan: "Япония",
  Switzerland: "Швейцария",
  UAE: "ОАЭ",
  Austria: "Австрия",
  "Czech Republic": "Чехия",
  Singapore: "Сингапур",
};

export function getCountryLabel(raw: string): string {
  return COUNTRY_LABELS[raw] ?? raw;
}

export type ProfileData = {
  full_name: string | null;
  path: ApplicantPath | null;
  grade_or_year: string | null;
  city: string | null;
  target_countries: string[];
  intended_major: string | null;
  budget_usd: number | null;
  needs_scholarship: boolean;
  gpa: number | null;
  gpa_scale: number | null;
  exams: ExamEntry[];
  activities: Activity[];
  cv: Cv;
  onboarding_completed: boolean;
  onboarding_step: number;
  intake_year: number | null;
  english_level: string | null;
};

export function emptyCv(): Cv {
  return {
    summary: "",
    skills: [],
    languages: [],
    contacts: { phone: "", city: "", links: [] },
    education: { institution: "" },
    headingsLang: "ru",
  };
}

export function emptyProfile(): ProfileData {
  return {
    full_name: null,
    path: null,
    grade_or_year: null,
    city: null,
    target_countries: [],
    intended_major: null,
    budget_usd: null,
    needs_scholarship: false,
    gpa: null,
    gpa_scale: null,
    exams: [],
    activities: [],
    cv: emptyCv(),
    onboarding_completed: false,
    onboarding_step: 0,
    intake_year: null,
    english_level: null,
  };
}
