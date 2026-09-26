import { z } from "zod";

export const shortlistCategorySchema = z.enum(["dream", "target", "safety"]);

export const addShortlistSchema = z.object({
  universityId: z.uuid("Некорректный вуз."),
  category: shortlistCategorySchema,
  note: z.string().trim().max(500, "Заметка слишком длинная.").optional(),
});

export const removeShortlistSchema = z.object({
  universityId: z.uuid("Некорректный вуз."),
});

export const changeShortlistCategorySchema = z.object({
  universityId: z.uuid("Некорректный вуз."),
  category: shortlistCategorySchema,
});

export const taskStatusSchema = z.enum(["todo", "in_progress", "done"]);

export const createTaskSchema = z.object({
  title: z.string().trim().min(1, "Введите название.").max(200, "Название слишком длинное."),
  description: z.string().trim().max(4000, "Описание слишком длинное.").optional(),
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Дата должна быть в формате ГГГГ-ММ-ДД.")
    .optional(),
  relatedType: z.enum(["university", "exam", "opportunity"]).optional(),
  relatedId: z.uuid("Некорректная связь.").optional(),
});

export const updateTaskStatusSchema = z.object({
  taskId: z.uuid("Некорректная задача."),
  status: taskStatusSchema,
});

export const deleteTaskSchema = z.object({
  taskId: z.uuid("Некорректная задача."),
});

export const restoreTaskSchema = z.object({
  title: z.string().trim().min(1, "Введите название.").max(200, "Название слишком длинное."),
  description: z.string().trim().max(4000, "Описание слишком длинное.").nullable().optional(),
  dueDate: z
    .union([
      z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Дата должна быть в формате ГГГГ-ММ-ДД."),
      z.null(),
    ])
    .optional(),
  status: taskStatusSchema,
  source: z.enum(["roadmap", "agent", "manual"]),
  relatedType: z.enum(["university", "exam", "opportunity"]).nullable().optional(),
  relatedId: z.union([z.uuid("Некорректная связь."), z.null()]).optional(),
  roadmapKey: z.string().trim().max(120).nullable().optional(),
});

export const weeklyGoalSchema = z.object({
  weeklyGoal: z
    .number()
    .int("Цель должна быть целым числом.")
    .min(1, "Цель от 1 до 50.")
    .max(50, "Цель от 1 до 50.")
    .nullable(),
});

export const addPathPlanSchema = z.object({
  universityId: z.uuid("Некорректный вуз."),
  comboIndex: z.number().int().min(0).max(2),
});

export const freeOnlySchema = z.object({
  freeOnly: z.boolean(),
});

export const mentorQuestionSchema = z.object({
  title: z.string().trim().min(3, "Заголовок от 3 до 200 символов.").max(200, "Заголовок от 3 до 200 символов."),
  body: z.string().trim().min(1, "Введите текст вопроса.").max(4000, "Текст слишком длинный."),
  tags: z.array(z.string().trim().min(1).max(40)).max(8).optional(),
});

export const mentorAnswerSchema = z.object({
  questionId: z.uuid("Некорректный вопрос."),
  body: z.string().trim().min(1, "Введите ответ.").max(4000, "Ответ слишком длинный."),
});

export const agentUserMessageSchema = z.object({
  message: z.string().trim().min(1, "Введите сообщение.").max(4000, "Сообщение слишком длинное."),
});
