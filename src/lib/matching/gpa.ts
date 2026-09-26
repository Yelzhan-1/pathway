const SCALES = [4, 5, 10, 100] as const;

function coerceNumber(raw: unknown): number | null {
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  if (typeof raw !== "string") return null;
  const text = raw.trim().replace(",", ".");
  if (!text) return null;
  const value = Number(text);
  return Number.isFinite(value) ? value : null;
}

export function gpaRatio(gpa: number | null, scale: number | null): number | null {
  if (gpa == null || scale == null) return null;
  if (!SCALES.includes(scale as (typeof SCALES)[number])) return null;
  if (!Number.isFinite(gpa) || gpa < 0 || gpa > scale) return null;
  return gpa / scale;
}

function ratioOnScale(raw: number, scale: number): number | null {
  if (!Number.isFinite(scale) || scale <= 0) return null;
  return raw / scale;
}

/**
 * A numeric minimum on `requirements` (`gpa_min`, `gpa_minimum`, or `min_gpa`).
 * A text `gpa_note` is not parsed. Values in (0, 1] are already ratios.
 * Larger values use `requirements.gpa_scale` when it is 4, 5, 10, or 100.
 * Otherwise 1–4 is a 4-point scale, 4–5 a 5-point scale, 5–10 a 10-point scale,
 * and 10–100 a 100-point scale.
 */
export function universityGpaMinRatio(
  requirements: Record<string, unknown> | null,
): number | null {
  if (!requirements) return null;
  const raw = coerceNumber(requirements.gpa_min ?? requirements.gpa_minimum ?? requirements.min_gpa);
  if (raw == null || raw < 0) return null;
  if (raw <= 1) return raw;
  const explicit = coerceNumber(requirements.gpa_scale);
  if (explicit != null && SCALES.includes(explicit as (typeof SCALES)[number])) {
    return ratioOnScale(raw, explicit);
  }
  if (raw <= 4) return raw / 4;
  if (raw <= 5) return raw / 5;
  if (raw <= 10) return raw / 10;
  if (raw <= 100) return raw / 100;
  return null;
}
