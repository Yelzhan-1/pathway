const SCALES = [4, 5, 10, 100] as const;

export function gpaRatio(gpa: number | null, scale: number | null): number | null {
  if (gpa == null || scale == null) return null;
  if (!SCALES.includes(scale as (typeof SCALES)[number])) return null;
  if (!Number.isFinite(gpa) || gpa < 0 || gpa > scale) return null;
  return gpa / scale;
}

/**
 * A numeric minimum on `requirements` (`gpa_min`, `gpa_minimum`, or `min_gpa`).
 * A text `gpa_note` is not parsed. Values in (0, 1] are already ratios.
 * Larger values are converted only when `requirements.gpa_scale` is 4, 5, 10, or 100.
 */
export function universityGpaMinRatio(
  requirements: Record<string, unknown> | null,
): number | null {
  if (!requirements) return null;
  const raw = requirements.gpa_min ?? requirements.gpa_minimum ?? requirements.min_gpa;
  if (typeof raw !== "number" || !Number.isFinite(raw) || raw < 0) return null;
  if (raw <= 1) return raw;
  const scale = requirements.gpa_scale;
  if (typeof scale === "number" && SCALES.includes(scale as (typeof SCALES)[number])) {
    return raw / scale;
  }
  return null;
}
