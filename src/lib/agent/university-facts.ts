import type { FitResult } from "@/lib/matching/types";
import { strings } from "@/lib/strings";

/** Same wording as the university card when no IELTS/TOEFL/DET minimum is published. */
export function englishRequirementLabel(fit: FitResult): string {
  const english = fit.checks.find((check) => check.key === "english");
  const need = english?.need?.trim();
  if (need) return need;
  return strings.fit.check.unknown;
}
