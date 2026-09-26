import { z } from "zod";

import {
  addShortlistSchema,
  createTaskSchema,
  deleteTaskSchema,
  removeShortlistSchema,
  updateTaskStatusSchema,
} from "@/lib/actions/schemas";
import { EXAM_CODES } from "@/lib/profile/exam-ranges";

export const searchUniversitiesInputSchema = z.object({
  query: z.union([z.string().trim().max(200), z.array(z.string().trim().max(200))]).optional(),
  region: z.enum(["kazakhstan", "usa", "uk", "europe", "asia_other"]).optional(),
  country: z.string().trim().max(80).optional(),
  major: z.string().trim().max(120).optional(),
  maxTuition: z.number().nonnegative().optional(),
  freeOrGrantOnly: z.boolean().optional(),
  satPolicy: z.enum(["required", "optional", "not_used", "unknown"]).optional(),
});

const universityNameSchema = z.string().trim().min(1).max(200);

export const universitySlugInputSchema = z.object({
  slug: universityNameSchema,
});

/** One name, or several. A list must not fail validation. */
export const universityLookupInputSchema = z.object({
  slug: z.union([universityNameSchema, z.array(universityNameSchema)]).optional(),
  name: z.union([universityNameSchema, z.array(universityNameSchema)]).optional(),
  names: z.array(universityNameSchema).optional(),
  slugs: z.array(universityNameSchema).optional(),
});

export function universityNamesFromInput(input: {
  slug?: string | string[];
  name?: string | string[];
  names?: string[];
  slugs?: string[];
}): string[] {
  const raw = [input.slug, input.name, input.names, input.slugs].flatMap((value) => {
    if (value == null) return [];
    return Array.isArray(value) ? value : [value];
  });
  const names: string[] = [];
  for (const value of raw) {
    const text = value.trim();
    if (text && !names.includes(text)) names.push(text);
  }
  return names.slice(0, 8);
}

export const searchOpportunitiesInputSchema = z.object({
  type: z
    .enum([
      "olympiad",
      "summer_program",
      "internship",
      "competition",
      "research",
      "scholarship",
      "course",
    ])
    .optional(),
  format: z.enum(["online", "in_person", "hybrid", "unknown"]).optional(),
  freeOnly: z.boolean().optional(),
  upcomingOnly: z.boolean().optional(),
});

export const examCodeInputSchema = z.object({
  code: z.enum(EXAM_CODES),
});

export const createAgentTaskInputSchema = createTaskSchema;
export const updateAgentTaskInputSchema = updateTaskStatusSchema;
export const deleteAgentTaskInputSchema = deleteTaskSchema;
export const addShortlistInputSchema = addShortlistSchema;
export const removeShortlistInputSchema = removeShortlistSchema;

export const emptyInputSchema = z.object({});
