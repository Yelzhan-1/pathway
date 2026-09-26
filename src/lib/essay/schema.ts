import { z } from "zod";

/**
 * Zod schemas for the «Разбор мотивационного письма» feature (/essay).
 * Input: letter text + a university slug from the catalog.
 * Output: structured analysis from `generateObject` — never freeform text,
 * so the UI can render a score ring, criteria bars and fixed «3 правки» cards.
 */

export const ESSAY_LETTER_MAX_LENGTH = 6000;

export const essayRequestSchema = z.object({
  letter: z
    .string()
    .trim()
    .min(1, "Вставь текст письма.")
    .max(ESSAY_LETTER_MAX_LENGTH, `Письмо длиннее ${ESSAY_LETTER_MAX_LENGTH} символов. Сократи текст.`),
  universitySlug: z.string().trim().min(1, "Выбери вуз."),
});

export type EssayRequest = z.infer<typeof essayRequestSchema>;

/**
 * Fixed order — the model only returns a score + comment per id, never a label; the Russian
 * labels shown in the UI live in `strings.essay.criteria` (one source of truth for copy).
 */
export const ESSAY_CRITERIA_IDS = ["specifics", "fit", "motivation", "structure", "language"] as const;

export type EssayCriterionId = (typeof ESSAY_CRITERIA_IDS)[number];

const criterionSchema = z.object({
  id: z.enum(ESSAY_CRITERIA_IDS),
  score: z.number().int().min(1).max(5),
  comment: z.string().trim().min(1).max(400),
});

const editSchema = z.object({
  quote: z.string().trim().min(1).max(400),
  rewrite: z.string().trim().min(1).max(400),
  why: z.string().trim().min(1).max(220),
});

export const essayAnalysisSchema = z
  .object({
    overallScore: z.number().int().min(1).max(10),
    verdict: z.string().trim().min(1).max(220),
    criteria: z.array(criterionSchema).length(ESSAY_CRITERIA_IDS.length),
    strengths: z.array(z.string().trim().min(1).max(200)).min(2).max(3),
    blockers: z.array(z.string().trim().min(1).max(200)).min(2).max(3),
    edits: z.array(editSchema).length(3),
    nextStep: z.string().trim().min(1).max(240),
  })
  .refine(
    (value) => {
      const ids = value.criteria.map((criterion) => criterion.id);
      return (
        new Set(ids).size === ESSAY_CRITERIA_IDS.length &&
        ESSAY_CRITERIA_IDS.every((id) => ids.includes(id))
      );
    },
    { message: "Модель не вернула все пять критериев.", path: ["criteria"] },
  );

export type EssayAnalysis = z.infer<typeof essayAnalysisSchema>;
export type EssayCriterion = EssayAnalysis["criteria"][number];
export type EssayEdit = EssayAnalysis["edits"][number];

/** Reorders criteria into the fixed ESSAY_CRITERIA_IDS order regardless of what order the model returned them in. */
export function sortEssayCriteria(analysis: EssayAnalysis): EssayAnalysis {
  const byId = new Map(analysis.criteria.map((criterion) => [criterion.id, criterion] as const));
  const ordered = ESSAY_CRITERIA_IDS.map((id) => byId.get(id)).filter(
    (criterion): criterion is EssayCriterion => criterion != null,
  );
  if (ordered.length !== ESSAY_CRITERIA_IDS.length) return analysis;
  return { ...analysis, criteria: ordered };
}
