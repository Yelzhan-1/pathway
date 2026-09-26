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
  query: z.string().trim().max(200).optional(),
  region: z.enum(["kazakhstan", "usa", "uk", "europe", "asia_other"]).optional(),
  country: z.string().trim().max(80).optional(),
  major: z.string().trim().max(120).optional(),
  maxTuition: z.number().nonnegative().optional(),
  freeOrGrantOnly: z.boolean().optional(),
  satPolicy: z.enum(["required", "optional", "not_used", "unknown"]).optional(),
});

export const universitySlugInputSchema = z.object({
  slug: z.string().trim().min(1).max(200),
});

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
