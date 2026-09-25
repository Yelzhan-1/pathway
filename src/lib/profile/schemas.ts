import { z } from "zod";

import { strings } from "@/lib/strings";

import {
  A_LEVEL_GRADES,
  EXAM_CODES,
  EXAM_RANGES,
  EXAMS_WITH_OPTIONAL_SUBJECT,
  type ExamCode,
  type NumericExamCode,
} from "./exam-ranges";
import {
  ACTIVITY_TYPES,
  ENGLISH_LEVELS,
  GPA_SCALES,
  GRADUATE_GRADES,
  INTAKE_YEAR_MAX,
  INTAKE_YEAR_MIN,
  TRANSFER_YEARS,
} from "./types";

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, strings.profile.errors.invalidDate)
  .nullable()
  .optional();

function isNumericExamCode(code: ExamCode): code is NumericExamCode {
  return code !== "A_LEVEL";
}

function scoreMatchesIeltsStep(score: number): boolean {
  return Math.abs(score * 2 - Math.round(score * 2)) < 1e-8;
}

export const examEntrySchema = z
  .object({
    code: z.enum(EXAM_CODES),
    status: z.enum(["taken", "planned"]),
    date: isoDate,
    subject: z.string().trim().max(80).nullable().optional(),
    score: z.union([z.number(), z.string()]),
  })
  .superRefine((value, ctx) => {
    const date = value.date ?? null;
    if (value.status === "taken" && !date) {
      ctx.addIssue({
        code: "custom",
        path: ["date"],
        message: strings.profile.errors.examDateRequired,
      });
    }

    if (value.code === "A_LEVEL") {
      if (
        typeof value.score !== "string" ||
        !A_LEVEL_GRADES.includes(value.score as (typeof A_LEVEL_GRADES)[number])
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["score"],
          message: strings.profile.errors.aLevelGrade,
        });
      }
      return;
    }

    if (!isNumericExamCode(value.code) || typeof value.score !== "number") {
      ctx.addIssue({
        code: "custom",
        path: ["score"],
        message: strings.profile.errors.examScoreInvalid,
      });
      return;
    }

    if (!Number.isFinite(value.score)) {
      ctx.addIssue({
        code: "custom",
        path: ["score"],
        message: strings.profile.errors.examScoreInvalid,
      });
      return;
    }

    const range = EXAM_RANGES[value.code];
    if (value.score < range.min || value.score > range.max) {
      ctx.addIssue({
        code: "custom",
        path: ["score"],
        message: strings.profile.errors.examScoreRange(
          value.code,
          range.min,
          range.max,
        ),
      });
    }

    if (value.code === "IELTS" && !scoreMatchesIeltsStep(value.score)) {
      ctx.addIssue({
        code: "custom",
        path: ["score"],
        message: strings.profile.errors.ieltsStep,
      });
    }

    if (
      !EXAMS_WITH_OPTIONAL_SUBJECT.has(value.code) &&
      value.subject != null &&
      value.subject !== ""
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["subject"],
        message: strings.profile.errors.subjectNotAllowed,
      });
    }
  });

export const examsArraySchema = z.array(examEntrySchema).max(30);

export const pathSchema = z.enum(["graduate", "transfer"], {
  error: strings.profile.errors.pathRequired,
});

export const statusStepSchema = z
  .object({
    path: pathSchema,
    grade_or_year: z.string().trim().min(1, strings.profile.errors.gradeRequired),
  })
  .superRefine((value, ctx) => {
    const allowed =
      value.path === "graduate" ? GRADUATE_GRADES : TRANSFER_YEARS;
    if (!(allowed as readonly string[]).includes(value.grade_or_year)) {
      ctx.addIssue({
        code: "custom",
        path: ["grade_or_year"],
        message: strings.profile.errors.gradeMismatch,
      });
    }
  });

export const cityStepSchema = z.object({
  city: z.string().trim().min(1, strings.profile.errors.cityRequired).max(80),
});

export const majorStepSchema = z.object({
  intended_major: z
    .string()
    .trim()
    .min(1, strings.profile.errors.majorRequired)
    .max(120),
});

export const countriesStepSchema = z.object({
  target_countries: z
    .array(z.string().trim().min(1))
    .min(1, strings.profile.errors.countriesRequired)
    .max(20),
});

export const budgetStepSchema = z.object({
  budget_usd: z.number().int().min(0, strings.profile.errors.budgetInvalid),
  needs_scholarship: z.boolean(),
});

export const englishLevelSchema = z.enum(ENGLISH_LEVELS, {
  error: strings.profile.errors.englishRequired,
});

export const englishStepSchema = z.object({
  english_level: englishLevelSchema,
  exams: examsArraySchema.default([]),
});

export const examsStepSchema = z.object({
  exams: examsArraySchema.default([]),
});

export const gpaScaleSchema = z.union([
  z.literal(4),
  z.literal(5),
  z.literal(10),
  z.literal(100),
]);

export const gpaStepSchema = z
  .object({
    gpa: z.number().min(0, strings.profile.errors.gpaInvalid),
    gpa_scale: gpaScaleSchema,
  })
  .superRefine((value, ctx) => {
    if (!(GPA_SCALES as readonly number[]).includes(value.gpa_scale)) {
      ctx.addIssue({
        code: "custom",
        path: ["gpa_scale"],
        message: strings.profile.errors.gpaScaleInvalid,
      });
    }
    if (value.gpa > value.gpa_scale) {
      ctx.addIssue({
        code: "custom",
        path: ["gpa"],
        message: strings.profile.errors.gpaExceedsScale,
      });
    }
  });

export const intakeYearStepSchema = z.object({
  intake_year: z
    .number()
    .int()
    .min(INTAKE_YEAR_MIN, strings.profile.errors.intakeYearRange)
    .max(INTAKE_YEAR_MAX, strings.profile.errors.intakeYearRange),
});

export const activitySchema = z.object({
  id: z.string().min(1).max(80),
  type: z.enum(ACTIVITY_TYPES),
  title: z.string().trim().max(160),
  role: z.string().trim().max(120),
  organization: z.string().trim().max(160),
  description: z.string().trim().max(2000),
  start_date: isoDate,
  end_date: isoDate,
  achievement: z.string().trim().max(400),
});

export const activitiesSchema = z.array(activitySchema).max(50);

export const cvLinkSchema = z.object({
  label: z.string().trim().max(80),
  url: z.string().trim().max(300),
});

export const cvSchema = z.object({
  summary: z.string().max(3000),
  skills: z.array(z.string().trim().min(1).max(60)).max(40),
  languages: z
    .array(
      z.object({
        name: z.string().trim().min(1).max(60),
        level: z.string().trim().max(40),
      }),
    )
    .max(20),
  contacts: z.object({
    phone: z.string().trim().max(40),
    city: z.string().trim().max(80),
    links: z.array(cvLinkSchema).max(10),
  }),
  education: z.object({
    institution: z.string().trim().max(160),
  }),
  headingsLang: z.enum(["ru", "en"]),
});

export const profileFormSchema = z
  .object({
    full_name: z.string().trim().min(1, strings.auth.errors.fullNameRequired).max(120),
    path: pathSchema,
    grade_or_year: z.string().trim().min(1, strings.profile.errors.gradeRequired),
    city: z.string().trim().min(1, strings.profile.errors.cityRequired).max(80),
    intended_major: z.string().trim().max(120).nullable(),
    target_countries: z.array(z.string().trim().min(1)).max(20),
    budget_usd: z.number().int().min(0).nullable(),
    needs_scholarship: z.boolean(),
    english_level: englishLevelSchema.nullable(),
    exams: examsArraySchema,
    gpa: z.number().min(0).nullable(),
    gpa_scale: gpaScaleSchema.nullable(),
    intake_year: z
      .number()
      .int()
      .min(INTAKE_YEAR_MIN)
      .max(INTAKE_YEAR_MAX)
      .nullable(),
  })
  .superRefine((value, ctx) => {
    const allowed =
      value.path === "graduate" ? GRADUATE_GRADES : TRANSFER_YEARS;
    if (!(allowed as readonly string[]).includes(value.grade_or_year)) {
      ctx.addIssue({
        code: "custom",
        path: ["grade_or_year"],
        message: strings.profile.errors.gradeMismatch,
      });
    }
    if (value.gpa != null) {
      if (value.gpa_scale == null) {
        ctx.addIssue({
          code: "custom",
          path: ["gpa_scale"],
          message: strings.profile.errors.gpaScaleInvalid,
        });
      } else if (value.gpa > value.gpa_scale) {
        ctx.addIssue({
          code: "custom",
          path: ["gpa"],
          message: strings.profile.errors.gpaExceedsScale,
        });
      }
    }
  });

export type StatusStepInput = z.infer<typeof statusStepSchema>;
export type CityStepInput = z.infer<typeof cityStepSchema>;
export type MajorStepInput = z.infer<typeof majorStepSchema>;
export type CountriesStepInput = z.infer<typeof countriesStepSchema>;
export type BudgetStepInput = z.infer<typeof budgetStepSchema>;
export type EnglishStepInput = z.infer<typeof englishStepSchema>;
export type ExamsStepInput = z.infer<typeof examsStepSchema>;
export type GpaStepInput = z.infer<typeof gpaStepSchema>;
export type IntakeYearStepInput = z.infer<typeof intakeYearStepSchema>;
export type ProfileFormInput = z.infer<typeof profileFormSchema>;
export type ActivityInput = z.infer<typeof activitySchema>;
export type CvInput = z.infer<typeof cvSchema>;
export type ExamEntryInput = z.infer<typeof examEntrySchema>;
