/**
 * Undergraduate admit rates for catalog rows whose `acceptance_rate` column is null.
 * Same unit as the column: a percent, so 4.2 means 4.2% (MIT is already stored as 4.60).
 * `acceptanceFraction` treats a value above 1 as a percent.
 * Each figure is the latest official class profile or Common Data Set. Source URL is on the line above.
 * KAIST publishes a domestic early-admission competition ratio, not an overall admit rate, so it is omitted.
 */
export const CATALOG_ACCEPTANCE_RATE: Record<string, number> = {
  // Class of 2029 admit rate 4.2% (47,893 applicants, 2,003 admitted).
  // https://oira.harvard.edu/factbook/fact-book-admissions/
  harvard: 4.2,
  // CDS 2025-2026, Class of 2029: 60,646 applicants, 2,302 admitted = 3.80%.
  // https://irds.stanford.edu/data-findings/cds
  stanford: 3.8,
  // CDS 2025-26, Fall 2025: 42,303 applicants, 1,868 admitted = 4.42%.
  // https://ir.princeton.edu/sites/g/files/toruqf2041/files/documents/CDS_2526_Princeton_v2.pdf
  princeton: 4.42,
  // Yale News, Class of 2029: 2,308 admitted of 50,228 applicants = 4.60%.
  // https://news.yale.edu/2025/03/27/yale-admits-2308-applicants-class-2029
  yale: 4.6,
  // Class of 2029 profile: 59,616 applications, 2,946 admits = 4.94%.
  // https://undergrad.admissions.columbia.edu/sites/default/files/2025-08/Columbia%20Class%20of%202029%20Profile.pdf
  columbia: 4.94,
  // Office of Admissions, Class of 2029: 1,702 admitted of 28,230 applicants, published as 6%.
  // https://admissions.dartmouth.edu/news/2025/03/dartmouth-offers-admission-1702-undergrad-applicants
  dartmouth: 6,
  // Class of 2029 profile labels the overall rate 5.2% (58,712 applications).
  // https://admissions.duke.edu/wp-content/uploads/2026/02/2029ClassProfile.pdf
  duke: 5.2,
  // Class of 2029: 15,819 applicants, 1,222 admitted = 7.72%.
  // https://www.amherst.edu/news/news_releases/2025/september/welcome-new-mammoths
  amherst: 7.72,
  // Class of 2029: 1,334 offers of 29,281 applications, published as 4.6%.
  // https://facts.mit.edu/undergraduate-admissions/
  mit: 4.6,
  // Institutional Research, Class of 2029: 957 admitted of 14,045 applicants, published as 6.8%.
  // https://www.bowdoin.edu/ir/data/index.html
  bowdoin: 6.8,
  // IPEDS admissions the university reported for 2024: 330 admitted of 10,864 applicants = 3.04%.
  // https://nces.ed.gov/collegenavigator/?id=484844
  minerva: 3.04,
};

export function coerceFinite(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value.trim().replace(",", "."));
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

/** Database value wins. A null column uses the catalog file. */
export function resolveAcceptanceRate(slug: string, raw: unknown): number | null {
  return coerceFinite(raw) ?? CATALOG_ACCEPTANCE_RATE[slug] ?? null;
}
