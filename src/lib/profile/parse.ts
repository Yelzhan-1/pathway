import type { ApplicantPath, Json } from "@/lib/database.types";
import type { Database } from "@/lib/database.types";

import { A_LEVEL_GRADES, EXAM_CODES, type ExamCode } from "./exam-ranges";
import { examEntrySchema } from "./schemas";
import {
  ACTIVITY_TYPES,
  emptyCv,
  emptyProfile,
  type Activity,
  type ActivityType,
  type Cv,
  type CvHeadingsLang,
  type ExamEntry,
  type ExamStatus,
  type ProfileData,
} from "./types";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asNullableString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

function parseExamStatus(value: unknown): ExamStatus {
  return value === "planned" ? "planned" : "taken";
}

function parseExamEntry(value: unknown): ExamEntry | null {
  if (!isRecord(value)) return null;
  const parsed = examEntrySchema.safeParse({
    code: value.code,
    status: parseExamStatus(value.status),
    date: typeof value.date === "string" ? value.date : null,
    subject: typeof value.subject === "string" ? value.subject : null,
    score: value.score,
  });
  if (!parsed.success) return null;
  if (parsed.data.code === "A_LEVEL") {
    return {
      code: "A_LEVEL",
      score: parsed.data.score as (typeof A_LEVEL_GRADES)[number],
      date: parsed.data.date ?? null,
      status: parsed.data.status,
      subject: parsed.data.subject ?? null,
    };
  }
  return {
    code: parsed.data.code,
    score: parsed.data.score as number,
    date: parsed.data.date ?? null,
    status: parsed.data.status,
    subject: parsed.data.subject ?? null,
  };
}

export function parseExams(value: Json | ExamEntry[] | null | undefined): ExamEntry[] {
  if (!Array.isArray(value)) return [];
  const exams: ExamEntry[] = [];
  for (const entry of value) {
    const parsed = parseExamEntry(entry);
    if (parsed) exams.push(parsed);
  }
  return exams;
}

export function parseActivities(
  value: Json | Activity[] | null | undefined,
): Activity[] {
  if (!Array.isArray(value)) return [];
  const activities: Activity[] = [];
  for (const entry of value) {
    if (!isRecord(entry)) continue;
    const type = ACTIVITY_TYPES.includes(entry.type as ActivityType)
      ? (entry.type as ActivityType)
      : "other";
    const id = asString(entry.id);
    activities.push({
      id: id || `act_${activities.length}`,
      type,
      title: asString(entry.title),
      role: asString(entry.role),
      organization: asString(entry.organization),
      description: asString(entry.description),
      start_date: asNullableString(entry.start_date),
      end_date: asNullableString(entry.end_date),
      achievement: asString(entry.achievement),
    });
  }
  return activities;
}

export function parseCv(value: Json | Cv | null | undefined): Cv {
  const base = emptyCv();
  if (!isRecord(value)) return base;

  const contacts = isRecord(value.contacts) ? value.contacts : {};
  const education = isRecord(value.education) ? value.education : {};
  const headingsLang: CvHeadingsLang =
    value.headingsLang === "en" ? "en" : "ru";

  const links = Array.isArray(contacts.links)
    ? contacts.links.flatMap((link) => {
        if (!isRecord(link)) return [];
        return [
          {
            label: asString(link.label),
            url: asString(link.url),
          },
        ];
      })
    : [];

  const skills: string[] = [];
  if (Array.isArray(value.skills)) {
    for (const item of value.skills) {
      if (typeof item === "string") skills.push(item);
    }
  }

  const languages = Array.isArray(value.languages)
    ? value.languages.flatMap((item) => {
        if (typeof item === "string") {
          return [{ name: item, level: "" }];
        }
        if (!isRecord(item)) return [];
        return [{ name: asString(item.name), level: asString(item.level) }];
      })
    : [];

  return {
    summary: asString(value.summary),
    skills,
    languages,
    contacts: {
      phone: asString(contacts.phone),
      city: asString(contacts.city),
      links,
    },
    education: {
      institution: asString(education.institution),
    },
    headingsLang,
  };
}

export function parseProfile(
  row: ProfileRow | null | undefined,
): ProfileData {
  if (!row) return emptyProfile();
  const path: ApplicantPath | null =
    row.path === "graduate" || row.path === "transfer" ? row.path : null;

  return {
    full_name: row.full_name,
    path,
    grade_or_year: row.grade_or_year,
    city: row.city,
    target_countries: Array.isArray(row.target_countries)
      ? row.target_countries.filter((item): item is string => typeof item === "string")
      : [],
    intended_major: row.intended_major,
    budget_usd: row.budget_usd,
    needs_scholarship: Boolean(row.needs_scholarship),
    gpa: row.gpa,
    gpa_scale: row.gpa_scale,
    exams: parseExams(row.exams),
    activities: parseActivities(row.activities),
    cv: parseCv(row.cv),
    onboarding_completed: Boolean(row.onboarding_completed),
    onboarding_step: Number.isFinite(row.onboarding_step)
      ? row.onboarding_step
      : 0,
    intake_year: row.intake_year,
    english_level: row.english_level,
  };
}

export function examKey(entry: { code: string; subject?: string | null }): string {
  const subject = entry.subject?.trim();
  return subject ? `${entry.code}:${subject}` : entry.code;
}

export function mergeExams(
  existing: ExamEntry[],
  incoming: ExamEntry[],
): ExamEntry[] {
  const map = new Map<string, ExamEntry>();
  for (const entry of existing) {
    map.set(examKey(entry), entry);
  }
  for (const entry of incoming) {
    map.set(examKey(entry), entry);
  }
  return [...map.values()];
}

/** Replace one exam group (language or academic) and keep the other untouched. */
export function replaceExamGroup(
  existing: ExamEntry[],
  incoming: ExamEntry[],
  group: readonly string[],
): ExamEntry[] {
  const codes = new Set(group);
  const kept = existing.filter((entry) => !codes.has(entry.code));
  const next = incoming.filter((entry) => codes.has(entry.code));
  return [...kept, ...next];
}

export function isKnownExamCode(value: string): value is ExamCode {
  return (EXAM_CODES as readonly string[]).includes(value);
}
