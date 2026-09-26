import { COUNTRY_LABELS, MAJOR_OPTIONS } from "@/lib/profile/types";

export function normalizeSearch(value: string): string {
  return value.trim().toLocaleLowerCase("ru").replace(/\s+/g, " ");
}

const MAJOR_ALIASES: Record<(typeof MAJOR_OPTIONS)[number], readonly string[]> = {
  "Компьютерные науки": [
    "computer science",
    "cs",
    "computing",
    "informatics",
    "информатика",
    "software engineering",
    "программирование",
    "information technology",
    "it",
    "computer engineering",
  ],
  Инженерия: [
    "engineering",
    "engineer",
    "mechanical engineering",
    "electrical engineering",
    "civil engineering",
    "chemical engineering",
  ],
  Медицина: ["medicine", "medical", "pre-med", "healthcare", "health sciences", "nursing"],
  "Бизнес и экономика": [
    "business",
    "economics",
    "finance",
    "management",
    "экономика",
    "бизнес",
    "accounting",
    "business administration",
  ],
  Право: ["law", "legal", "jurisprudence", "llb"],
  "Международные отношения": [
    "international relations",
    "ir",
    "diplomacy",
    "international studies",
    "political science",
  ],
  "Архитектура и дизайн": ["architecture", "design", "архитектура", "дизайн", "urban planning"],
  "Естественные науки": [
    "natural sciences",
    "biology",
    "chemistry",
    "physics",
    "life sciences",
    "естественные науки",
  ],
  "Математика и статистика": ["mathematics", "math", "maths", "statistics", "математика", "статистика"],
  Психология: ["psychology", "психология"],
  Педагогика: ["education", "pedagogy", "teaching", "teacher training"],
  "Журналистика и медиа": [
    "journalism",
    "media",
    "communication",
    "communications",
    "журналистика",
    "медиа",
  ],
  Искусство: ["art", "arts", "fine art", "fine arts", "искусство", "music", "theatre", "theater"],
};

const PLACE_ALIASES: ReadonlyArray<readonly string[]> = [
  ["cambridge", "кембридж"],
  ["nazarbayev", "назарбаев"],
  ["harvard", "гарвард"],
  ["oxford", "оксфорд"],
  ["stanford", "стэнфорд", "стенфорд"],
  ["almaty", "алматы"],
  ["astana", "астана", "нур-султан"],
  ["boston", "бостон"],
  ["london", "лондон"],
  ["seoul", "сеул"],
  ["tokyo", "токио"],
];

const EXTRA_COUNTRY_LABELS: Record<string, string> = {
  ...COUNTRY_LABELS,
  "United States": "США",
  US: "США",
  "United Kingdom": "Великобритания",
  "Great Britain": "Великобритания",
  Italy: "Италия",
  France: "Франция",
  Spain: "Испания",
  Canada: "Канада",
  Poland: "Польша",
  Malaysia: "Малайзия",
  Korea: "Южная Корея",
};

function unique(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

function aliasGroup(value: string): string[] {
  const needle = normalizeSearch(value);
  if (!needle) return [];
  for (const group of PLACE_ALIASES) {
    if (group.some((item) => item === needle || needle.includes(item) || item.includes(needle))) {
      return [...group];
    }
  }
  return [needle];
}

function countryTokens(value: string): string[] {
  const needle = normalizeSearch(value);
  if (!needle) return [];
  const tokens = [needle];
  for (const [en, ru] of Object.entries(EXTRA_COUNTRY_LABELS)) {
    const enN = normalizeSearch(en);
    const ruN = normalizeSearch(ru);
    if (needle === enN || needle === ruN || needle.includes(enN) || needle.includes(ruN)) {
      tokens.push(enN, ruN);
    }
  }
  return unique(tokens);
}

export function expandMajorTerms(value: string): string[] {
  const needle = normalizeSearch(value);
  if (!needle) return [];
  const tokens = [needle];
  for (const option of MAJOR_OPTIONS) {
    const optionN = normalizeSearch(option);
    const aliases = MAJOR_ALIASES[option].map(normalizeSearch);
    const group = unique([optionN, ...aliases]);
    if (group.some((item) => item === needle || (Math.min(item.length, needle.length) >= 4 && (item.includes(needle) || needle.includes(item))))) {
      tokens.push(...group);
    }
  }
  return unique(tokens);
}

export function expandQuery(value: string): string[] {
  const needle = normalizeSearch(value);
  if (!needle) return [];
  return unique([...expandMajorTerms(needle), ...aliasGroup(needle), ...countryTokens(needle)]);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function fuzzyIncludes(hay: string, needle: string): boolean {
  if (!hay || !needle) return false;
  if (hay === needle) return true;
  if (needle.length < 4) {
    return new RegExp(`(?:^|[^a-zа-яё0-9])${escapeRegExp(needle)}(?:[^a-zа-яё0-9]|$)`, "i").test(hay);
  }
  const shorter = Math.min(hay.length, needle.length);
  if (shorter < 4) return false;
  return hay.includes(needle) || needle.includes(hay);
}

function extraMajorLabel(needle: string): string | null {
  if (/(^|[^a-zа-яё])government([^a-zа-яё]|$)/.test(needle)) return "Государственное управление";
  if (/(^|[^a-zа-яё])history([^a-zа-яё]|$)/.test(needle)) return "История";
  return null;
}

export function uniqueDisplayMajors(majors: string[]): string[] {
  const seen = new Set<string>();
  const labels: string[] = [];
  for (const major of majors) {
    const label = displayMajor(major);
    const key = normalizeSearch(label);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    labels.push(label);
  }
  return labels;
}

export function displayMajor(value: string): string {
  const needle = normalizeSearch(value.replace(/\s*\(offered\)\s*/gi, " "));
  if (!needle) return value.trim();
  const extra = extraMajorLabel(needle);
  if (extra) return extra;
  for (const option of MAJOR_OPTIONS) {
    const optionN = normalizeSearch(option);
    const aliases = MAJOR_ALIASES[option].map(normalizeSearch);
    const group = unique([optionN, ...aliases]);
    if (group.some((item) => fuzzyIncludes(needle, item) || fuzzyIncludes(item, needle))) {
      return option;
    }
  }
  return value.replace(/\s*\(offered\)\s*/gi, "").trim() || value.trim();
}

export function majorMatches(intended: string, majors: string[]): boolean {
  const needles = expandMajorTerms(intended);
  if (needles.length === 0) return false;
  return majors.some((major) => {
    const hays = expandMajorTerms(major);
    if (hays.length === 0) return false;
    return needles.some((needle) => hays.some((hay) => fuzzyIncludes(hay, needle)));
  });
}

export function universityMatchesQuery(
  university: {
    name: string;
    city: string | null;
    country: string;
    slug: string;
    majors: string[] | null;
  },
  query: string,
): boolean {
  const needles = expandQuery(query);
  if (needles.length === 0) return true;
  const haystack = unique(
    [
      university.name,
      university.city ?? "",
      university.country,
      university.slug.replace(/-/g, " "),
      EXTRA_COUNTRY_LABELS[university.country] ?? "",
      ...(university.majors ?? []),
    ].flatMap((part) => expandQuery(part)),
  );
  return needles.some((needle) => haystack.some((hay) => fuzzyIncludes(hay, needle)));
}
