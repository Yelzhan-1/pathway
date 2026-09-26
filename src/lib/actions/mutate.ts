import type { Database } from "@/lib/database.types";
import { toFitProfile, toFitUniversity } from "@/lib/data/map";
import { toUtcDateString } from "@/lib/matching/dates";
import type { FitProfile, FitUniversity } from "@/lib/matching/types";
import { parseProfile } from "@/lib/profile/parse";
import type { ExamCatalogItem } from "@/lib/prep/plan";
import { buildRoadmap } from "@/lib/roadmap/build";
import { applyRoadmapSync, type RoadmapStore } from "@/lib/roadmap/sync";

import { markActivity, type DbClient } from "./activity";
import { fail, ok, zodErrorRu, type ActionResult } from "./result";
import {
  addShortlistSchema,
  changeShortlistCategorySchema,
  createTaskSchema,
  deleteTaskSchema,
  freeOnlySchema,
  mentorAnswerSchema,
  mentorQuestionSchema,
  removeShortlistSchema,
  updateTaskStatusSchema,
  weeklyGoalSchema,
} from "./schemas";

type TaskSource = Database["public"]["Tables"]["tasks"]["Row"]["source"];

export function createRoadmapStore(supabase: DbClient, userId: string): RoadmapStore {
  return {
    async list() {
      const { data, error } = await supabase
        .from("tasks")
        .select(
          "id, roadmap_key, source, status, title, description, due_date, related_type, related_id",
        )
        .eq("user_id", userId);
      if (error) throw new Error(error.message);
      return (data ?? []).map((row) => ({
        id: row.id,
        roadmapKey: row.roadmap_key,
        source: row.source,
        status: row.status,
        title: row.title,
        description: row.description,
        dueDate: row.due_date,
        relatedType: row.related_type,
        relatedId: row.related_id,
      }));
    },
    async insert(task) {
      const { error } = await supabase.from("tasks").insert({
        user_id: userId,
        title: task.title,
        description: task.description,
        due_date: task.dueDate,
        status: "todo",
        source: "roadmap",
        related_type: task.relatedType,
        related_id: task.relatedId,
        roadmap_key: task.roadmapKey,
      });
      if (error) throw new Error(error.message);
    },
    async update(id, patch) {
      const { error } = await supabase
        .from("tasks")
        .update({
          title: patch.title,
          description: patch.description,
          due_date: patch.dueDate,
          related_type: patch.relatedType,
          related_id: patch.relatedId,
        })
        .eq("id", id)
        .eq("user_id", userId)
        .eq("source", "roadmap");
      if (error) throw new Error(error.message);
    },
  };
}

async function loadShortlistUniversities(
  supabase: DbClient,
  userId: string,
): Promise<FitUniversity[]> {
  const { data: rows, error } = await supabase
    .from("shortlist")
    .select("university_id")
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
  const ids = (rows ?? []).map((row) => row.university_id);
  if (ids.length === 0) return [];
  const { data: universities, error: universityError } = await supabase
    .from("universities")
    .select("*")
    .in("id", ids);
  if (universityError) throw new Error(universityError.message);
  return (universities ?? []).map(toFitUniversity);
}

async function loadExams(supabase: DbClient): Promise<ExamCatalogItem[]> {
  const { data, error } = await supabase
    .from("exams")
    .select("id, code, name, official_url, source_url, typical_test_dates_note");
  if (error) throw new Error(error.message);
  return data ?? [];
}

async function loadFitProfile(supabase: DbClient, userId: string): Promise<FitProfile | null> {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  if (error || !data) return null;
  return toFitProfile(parseProfile(data));
}

export async function addToShortlistForUser(
  supabase: DbClient,
  userId: string,
  input: unknown,
): Promise<ActionResult<{ universityId: string }>> {
  const parsed = addShortlistSchema.safeParse(input);
  if (!parsed.success) return fail(zodErrorRu(parsed.error));
  const { universityId, category, note } = parsed.data;
  const { data: existing, error: readError } = await supabase
    .from("shortlist")
    .select("id")
    .eq("user_id", userId)
    .eq("university_id", universityId)
    .maybeSingle();
  if (readError) return fail("Не удалось обновить список.");
  if (existing) {
    const { error } = await supabase
      .from("shortlist")
      .update({ category, note: note ?? null })
      .eq("id", existing.id)
      .eq("user_id", userId);
    if (error) return fail("Не удалось обновить список.");
  } else {
    const { error } = await supabase.from("shortlist").insert({
      user_id: userId,
      university_id: universityId,
      category,
      note: note ?? null,
    });
    if (error) return fail("Не удалось добавить вуз в список.");
  }
  await markActivity(supabase, userId);
  return ok({ universityId });
}

export async function removeFromShortlistForUser(
  supabase: DbClient,
  userId: string,
  input: unknown,
): Promise<ActionResult<{ universityId: string }>> {
  const parsed = removeShortlistSchema.safeParse(input);
  if (!parsed.success) return fail(zodErrorRu(parsed.error));
  const { error } = await supabase
    .from("shortlist")
    .delete()
    .eq("user_id", userId)
    .eq("university_id", parsed.data.universityId);
  if (error) return fail("Не удалось убрать вуз из списка.");
  await markActivity(supabase, userId);
  return ok({ universityId: parsed.data.universityId });
}

export async function changeShortlistCategoryForUser(
  supabase: DbClient,
  userId: string,
  input: unknown,
): Promise<ActionResult<{ universityId: string }>> {
  const parsed = changeShortlistCategorySchema.safeParse(input);
  if (!parsed.success) return fail(zodErrorRu(parsed.error));
  const { data, error } = await supabase
    .from("shortlist")
    .update({ category: parsed.data.category })
    .eq("user_id", userId)
    .eq("university_id", parsed.data.universityId)
    .select("id");
  if (error) return fail("Не удалось изменить категорию.");
  if (!data || data.length === 0) return fail("Этого вуза нет в списке.");
  await markActivity(supabase, userId);
  return ok({ universityId: parsed.data.universityId });
}

export async function createTaskForUser(
  supabase: DbClient,
  userId: string,
  input: unknown,
  source: Extract<TaskSource, "manual" | "agent">,
): Promise<ActionResult<{ id: string }>> {
  const parsed = createTaskSchema.safeParse(input);
  if (!parsed.success) return fail(zodErrorRu(parsed.error));
  const { data, error } = await supabase
    .from("tasks")
    .insert({
      user_id: userId,
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      due_date: parsed.data.dueDate ?? null,
      status: "todo",
      source,
      related_type: parsed.data.relatedType ?? null,
      related_id: parsed.data.relatedId ?? null,
    })
    .select("id")
    .single();
  if (error || !data) return fail("Не удалось создать задачу.");
  await markActivity(supabase, userId);
  return ok({ id: data.id });
}

export async function updateTaskStatusForUser(
  supabase: DbClient,
  userId: string,
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const parsed = updateTaskStatusSchema.safeParse(input);
  if (!parsed.success) return fail(zodErrorRu(parsed.error));
  const { data, error } = await supabase
    .from("tasks")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.taskId)
    .eq("user_id", userId)
    .select("id");
  if (error) return fail("Не удалось обновить задачу.");
  if (!data || data.length === 0) return fail("Задача не найдена.");
  await markActivity(supabase, userId);
  return ok({ id: parsed.data.taskId });
}

export async function deleteTaskForUser(
  supabase: DbClient,
  userId: string,
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const parsed = deleteTaskSchema.safeParse(input);
  if (!parsed.success) return fail(zodErrorRu(parsed.error));
  const { data, error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", parsed.data.taskId)
    .eq("user_id", userId)
    .select("id");
  if (error) return fail("Не удалось удалить задачу.");
  if (!data || data.length === 0) return fail("Задача не найдена.");
  await markActivity(supabase, userId);
  return ok({ id: parsed.data.taskId });
}

export async function syncRoadmapForUser(
  supabase: DbClient,
  userId: string,
  today: Date | string = new Date(),
): Promise<ActionResult<{ inserted: number; updated: number; unchanged: number }>> {
  try {
    const [universities, exams, profile] = await Promise.all([
      loadShortlistUniversities(supabase, userId),
      loadExams(supabase),
      loadFitProfile(supabase, userId),
    ]);
    const plan = buildRoadmap(universities, exams, today, profile);
    const stats = await applyRoadmapSync(createRoadmapStore(supabase, userId), plan);
    await markActivity(supabase, userId, toUtcDateString(today));
    return ok(stats);
  } catch (error) {
    console.error("syncRoadmap", error);
    return fail("Не удалось обновить дорожную карту.");
  }
}

export async function setWeeklyGoalForUser(
  supabase: DbClient,
  userId: string,
  input: unknown,
): Promise<ActionResult<{ weeklyGoal: number | null }>> {
  const parsed = weeklyGoalSchema.safeParse(input);
  if (!parsed.success) return fail(zodErrorRu(parsed.error));
  const { error } = await supabase
    .from("profiles")
    .update({ weekly_goal: parsed.data.weeklyGoal })
    .eq("id", userId);
  if (error) return fail("Не удалось сохранить цель.");
  await markActivity(supabase, userId);
  return ok({ weeklyGoal: parsed.data.weeklyGoal });
}

export async function setFreeOnlyForUser(
  supabase: DbClient,
  userId: string,
  input: unknown,
): Promise<ActionResult<{ freeOnly: boolean }>> {
  const parsed = freeOnlySchema.safeParse(input);
  if (!parsed.success) return fail(zodErrorRu(parsed.error));
  const { error } = await supabase
    .from("profiles")
    .update({ free_only: parsed.data.freeOnly })
    .eq("id", userId);
  if (error) return fail("Не удалось сохранить фильтр.");
  await markActivity(supabase, userId);
  return ok({ freeOnly: parsed.data.freeOnly });
}

export async function postMentorQuestionForUser(
  supabase: DbClient,
  userId: string,
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const parsed = mentorQuestionSchema.safeParse(input);
  if (!parsed.success) return fail(zodErrorRu(parsed.error));
  const { data, error } = await supabase
    .from("mentor_questions")
    .insert({
      user_id: userId,
      title: parsed.data.title,
      body: parsed.data.body,
      tags: parsed.data.tags ?? [],
    })
    .select("id")
    .single();
  if (error || !data) return fail("Не удалось опубликовать вопрос.");
  await markActivity(supabase, userId);
  return ok({ id: data.id });
}

export async function postMentorAnswerForUser(
  supabase: DbClient,
  userId: string,
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const parsed = mentorAnswerSchema.safeParse(input);
  if (!parsed.success) return fail(zodErrorRu(parsed.error));
  const { data, error } = await supabase
    .from("mentor_answers")
    .insert({
      user_id: userId,
      question_id: parsed.data.questionId,
      body: parsed.data.body,
    })
    .select("id")
    .single();
  if (error || !data) return fail("Не удалось опубликовать ответ.");
  await markActivity(supabase, userId);
  return ok({ id: data.id });
}
