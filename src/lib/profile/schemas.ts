import { z } from "zod";

import { strings } from "@/lib/strings";

import "./zod-ru";
import {
  A_LEVEL_GRADES,
  EXAM_CODES,
  EXAM_RANGES,
  EXAMS_WITH_OPTIONAL_SUBJECT,
  type ExamCode,
  type NumericExamCode,
} from "./exam-ranges";
import { getExamCodeLabel } from "./labels";
import {
  ACTIVITY_TYPES,
  ENGLISH_LEVELS,
  GPA_SCALES,
  GRADUATE_GRADES,
  INTAKE_YEAR_MAX,
  INTAKE_YEAR_MIN,
  TRANSFER_YEARS,
} from "./types";
import { isSafeHttpUrl } from "./url";

const isoDate = z
  .string({ error: strings.profile.errors.invalidDate })
  .regex(/^\d{4}-\d{2}-\d{2}$/, { error: strings.profile.errors.invalidDate })
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
    code: z.enum(EXAM_CODES, { error: strings.profile.errors.examScoreInvalid }),
    status: z.enum(["taken", "planned"], {
      error: strings.profile.errors.examScoreInvalid,
    }),
    date: isoDate,
    subject: z
      .string({ error: strings.profile.errors.invalidType })
      .trim()
      .max(80, { error: strings.profile.errors.tooBig })
      .nullable()
      .optional(),
    score: z.union([
      z.number({ error: strings.profile.errors.examScoreInvalid }),
      z.string({ error: strings.profile.errors.examScoreInvalid }),
    ]),
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
          getExamCodeLabel(value.code),
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

export const examsArraySchema = z
  .array(examEntrySchema, { error: strings.profile.errors.invalidType })
  .max(30, { error: strings.profile.errors.tooBig });

export const pathSchema = z.enum(["graduate", "transfer"], {
  error: strings.profile.errors.pathRequired,
});

export const statusStepSchema = z
  .object({
    path: pathSchema,
    grade_or_year: z
      .string({ error: strings.profile.errors.gradeRequired })
      .trim()
      .min(1, { error: strings.profile.errors.gradeRequired }),
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
  city: z
    .string({ error: strings.profile.errors.cityRequired })
    .trim()
    .min(1, { error: strings.profile.errors.cityRequired })
    .max(80, { error: strings.profile.errors.tooBig }),
});

export const majorStepSchema = z.object({
  intended_major: z
    .string({ error: strings.profile.errors.majorRequired })
    .trim()
    .min(1, { error: strings.profile.errors.majorRequired })
    .max(120, { error: strings.profile.errors.tooBig }),
});

export const countriesStepSchema = z.object({
  target_countries: z
    .array(z.string({ error: strings.profile.errors.invalidType }).trim().min(1, {
      error: strings.profile.errors.countriesRequired,
    }))
    .min(1, { error: strings.profile.errors.countriesRequired })
    .max(20, { error: strings.profile.errors.tooBig }),
});

export const budgetStepSchema = z.object({
  budget_usd: z
    .number({ error: strings.profile.errors.budgetInvalid })
    .int({ error: strings.profile.errors.budgetInvalid })
    .min(0, { error: strings.profile.errors.budgetInvalid }),
  needs_scholarship: z.boolean({ error: strings.profile.errors.invalidType }),
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
    gpa: z
      .number({ error: strings.profile.errors.gpaInvalid })
      .min(0, { error: strings.profile.errors.gpaInvalid }),
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
    .number({ error: strings.profile.errors.intakeYearRange })
    .int({ error: strings.profile.errors.intakeYearRange })
    .min(INTAKE_YEAR_MIN, { error: strings.profile.errors.intakeYearRange })
    .max(INTAKE_YEAR_MAX, { error: strings.profile.errors.intakeYearRange }),
});

export const activitySchema = z.object({
  id: z
    .string({ error: strings.profile.errors.invalidType })
    .min(1, { error: strings.profile.errors.tooSmall })
    .max(80, { error: strings.profile.errors.tooBig }),
  type: z.enum(ACTIVITY_TYPES, { error: strings.profile.errors.invalidType }),
  title: z
    .string({ error: strings.profile.errors.invalidType })
    .trim()
    .max(160, { error: strings.profile.errors.tooBig }),
  role: z
    .string({ error: strings.profile.errors.invalidType })
    .trim()
    .max(120, { error: strings.profile.errors.tooBig }),
  organization: z
    .string({ error: strings.profile.errors.invalidType })
    .trim()
    .max(160, { error: strings.profile.errors.tooBig }),
  description: z
    .string({ error: strings.profile.errors.invalidType })
    .trim()
    .max(2000, { error: strings.profile.errors.tooBig }),
  start_date: isoDate,
  end_date: isoDate,
  achievement: z
    .string({ error: strings.profile.errors.invalidType })
    .trim()
    .max(400, { error: strings.profile.errors.tooBig }),
});

export const activitiesSchema = z
  .array(activitySchema, { error: strings.profile.errors.invalidType })
  .max(50, { error: strings.profile.errors.tooBig });

export const cvLinkSchema = z.object({
  label: z
    .string({ error: strings.profile.errors.invalidType })
    .trim()
    .max(80, { error: strings.profile.errors.tooBig }),
  url: z
    .string({ error: strings.cv.errors.invalidUrl })
    .trim()
    .max(200, { error: strings.cv.errors.urlTooLong })
    .refine((value) => value === "" || isSafeHttpUrl(value), {
      error: strings.cv.errors.invalidUrl,
    }),
});

export const cvSchema = z.object({
  summary: z
    .string({ error: strings.profile.errors.invalidType })
    .max(3000, { error: strings.profile.errors.tooBig }),
  skills: z
    .array(
      z
        .string({ error: strings.profile.errors.invalidType })
        .trim()
        .min(1, { error: strings.profile.errors.tooSmall })
        .max(60, { error: strings.profile.errors.tooBig }),
    )
    .max(40, { error: strings.profile.errors.tooBig }),
  languages: z
    .array(
      z.object({
        name: z
          .string({ error: strings.profile.errors.invalidType })
          .trim()
          .min(1, { error: strings.profile.errors.tooSmall })
          .max(60, { error: strings.profile.errors.tooBig }),
        level: z
          .string({ error: strings.profile.errors.invalidType })
          .trim()
          .max(40, { error: strings.profile.errors.tooBig }),
      }),
    )
    .max(20, { error: strings.profile.errors.tooBig }),
  contacts: z.object({
    phone: z
      .string({ error: strings.profile.errors.invalidType })
      .trim()
      .max(40, { error: strings.profile.errors.tooBig }),
    city: z
      .string({ error: strings.profile.errors.invalidType })
      .trim()
      .max(80, { error: strings.profile.errors.tooBig }),
    links: z.array(cvLinkSchema).max(10, { error: strings.profile.errors.tooBig }),
  }),
  education: z.object({
    institution: z
      .string({ error: strings.profile.errors.invalidType })
      .trim()
      .max(160, { error: strings.profile.errors.tooBig }),
  }),
  headingsLang: z.enum(["ru", "en"], {
    error: strings.profile.errors.invalidType,
  }),
});

export const cvPatchSchema = z.object({
  summary: cvSchema.shape.summary.optional(),
  skills: cvSchema.shape.skills.optional(),
  languages: cvSchema.shape.languages.optional(),
  contacts: cvSchema.shape.contacts.partial().optional(),
  education: cvSchema.shape.education.partial().optional(),
  headingsLang: cvSchema.shape.headingsLang.optional(),
});

export const profileFormSchema = z
  .object({
    full_name: z
      .string({ error: strings.auth.errors.fullNameRequired })
      .trim()
      .min(1, { error: strings.auth.errors.fullNameRequired })
      .max(120, { error: strings.profile.errors.tooBig }),
    path: pathSchema,
    grade_or_year: z
      .string({ error: strings.profile.errors.gradeRequired })
      .trim()
      .min(1, { error: strings.profile.errors.gradeRequired }),
    city: z
      .string({ error: strings.profile.errors.cityRequired })
      .trim()
      .min(1, { error: strings.profile.errors.cityRequired })
      .max(80, { error: strings.profile.errors.tooBig }),
    intended_major: z
      .string({ error: strings.profile.errors.invalidType })
      .trim()
      .max(120, { error: strings.profile.errors.tooBig })
      .nullable(),
    target_countries: z
      .array(
        z
          .string({ error: strings.profile.errors.invalidType })
          .trim()
          .min(1, { error: strings.profile.errors.tooSmall }),
      )
      .max(20, { error: strings.profile.errors.tooBig }),
    budget_usd: z
      .number({ error: strings.profile.errors.budgetInvalid })
      .int({ error: strings.profile.errors.budgetInvalid })
      .min(0, { error: strings.profile.errors.budgetInvalid })
      .nullable(),
    needs_scholarship: z.boolean({ error: strings.profile.errors.invalidType }),
    english_level: englishLevelSchema,
    exams: examsArraySchema,
    gpa: z
      .number({ error: strings.profile.errors.gpaInvalid })
      .min(0, { error: strings.profile.errors.gpaInvalid })
      .nullable(),
    gpa_scale: gpaScaleSchema.nullable(),
    intake_year: z
      .number({ error: strings.profile.errors.intakeYearRange })
      .int({ error: strings.profile.errors.intakeYearRange })
      .min(INTAKE_YEAR_MIN, { error: strings.profile.errors.intakeYearRange })
      .max(INTAKE_YEAR_MAX, { error: strings.profile.errors.intakeYearRange }),
    city_is_other: z.boolean().optional(),
    major_is_other: z.boolean().optional(),
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
    if (value.city_is_other && value.city.trim().length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["city"],
        message: strings.profile.errors.cityOtherRequired,
      });
    }
    if (value.major_is_other && !value.intended_major?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["intended_major"],
        message: strings.profile.errors.majorOtherRequired,
      });
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
