import type { SupabaseClient } from "@supabase/supabase-js";

import type { DbClient } from "@/lib/actions/activity";
import type { Database } from "@/lib/database.types";
import { toUtcDateString } from "@/lib/matching/dates";
import { fitUniversity, rankUniversities } from "@/lib/matching/fit";
import type { FitResult, FitUniversity, UniversityFilters } from "@/lib/matching/types";
import { matchOpportunities, type OpportunityFilters } from "@/lib/opportunities/match";
import { prepPlan, type ExamCatalogItem, type PrepPlan } from "@/lib/prep/plan";
import { emptyProfile, type ProfileData } from "@/lib/profile/types";
import { parseProfile } from "@/lib/profile/parse";
import { buildProgress, type ProgressReport } from "@/lib/progress/readiness";
import { buildRoadmap, type RoadmapTaskDraft } from "@/lib/roadmap/build";

import { toFitProfile, toFitUniversity } from "./map";

type UniversityRow = Database["public"]["Tables"]["universities"]["Row"];

export type UniversityWithFit = FitUniversity & {
  fit: FitResult;
  website_url: string | null;
  extra_sources: string[] | null;
  last_verified: string;
  source_type: string;
  tuition_note: string | null;
};

const LOAD_ERROR = "Не удалось загрузить данные.";

async function profileBundle(supabase: DbClient, userId: string | null): Promise<{
  profile: ProfileData;
  weeklyGoal: number | null;
  freeOnly: boolean;
  isMentor: boolean;
}> {
  if (!userId) {
    return { profile: emptyProfile(), weeklyGoal: null, freeOnly: false, isMentor: false };
  }
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  if (error || !data) {
    return { profile: emptyProfile(), weeklyGoal: null, freeOnly: false, isMentor: false };
  }
  return {
    profile: parseProfile(data),
    weeklyGoal: data.weekly_goal,
    freeOnly: data.free_only,
    isMentor: data.is_mentor,
  };
}

function withSources(row: UniversityRow, fitProfileInput: ReturnType<typeof toFitProfile>, today: string): UniversityWithFit {
  const university = toFitUniversity(row);
  return {
    ...university,
    fit: fitUniversity(fitProfileInput, university, today),
    website_url: row.website_url,
    extra_sources: row.extra_sources,
    last_verified: row.last_verified,
    source_type: row.source_type,
    tuition_note: row.tuition_note,
  };
}

export async function loadUniversities(
  supabase: DbClient,
  userId: string | null,
  filters: UniversityFilters = {},
  today: Date | string = new Date(),
): Promise<{ items: UniversityWithFit[]; error_ru: string | null }> {
  const day = toUtcDateString(today);
  const [{ data, error }, bundle] = await Promise.all([
    supabase.from("universities").select("*"),
    profileBundle(supabase, userId),
  ]);
  if (error) return { items: [], error_ru: LOAD_ERROR };
  const profile = toFitProfile(bundle.profile);
  const universities = (data ?? []).map(toFitUniversity);
  const ranked = rankUniversities(
    profile,
    universities,
    { ...filters, freeOrGrantOnly: filters.freeOrGrantOnly ?? bundle.freeOnly },
    day,
  );
  const byId = new Map((data ?? []).map((row) => [row.id, row]));
  return {
    items: ranked.flatMap((university) => {
      const row = byId.get(university.id);
      if (!row) return [];
      return [withSources(row, profile, day)];
    }),
    error_ru: null,
  };
}

export async function loadUniversity(
  supabase: DbClient,
  userId: string | null,
  slug: string,
  today: Date | string = new Date(),
): Promise<{ item: UniversityWithFit | null; error_ru: string | null }> {
  const day = toUtcDateString(today);
  const [{ data, error }, bundle] = await Promise.all([
    supabase.from("universities").select("*").eq("slug", slug).maybeSingle(),
    profileBundle(supabase, userId),
  ]);
  if (error) return { item: null, error_ru: LOAD_ERROR };
  if (!data) return { item: null, error_ru: null };
  return { item: withSources(data, toFitProfile(bundle.profile), day), error_ru: null };
}

export async function loadShortlist(
  supabase: DbClient,
  userId: string,
  today: Date | string = new Date(),
) {
  const day = toUtcDateString(today);
  const [{ data: rows, error }, bundle] = await Promise.all([
    supabase
      .from("shortlist")
      .select("id, university_id, category, note, created_at")
      .eq("user_id", userId),
    profileBundle(supabase, userId),
  ]);
  if (error) return { items: [], error_ru: LOAD_ERROR };
  const ids = (rows ?? []).map((row) => row.university_id);
  if (ids.length === 0) return { items: [], error_ru: null };
  const { data: universities, error: universityError } = await supabase
    .from("universities")
    .select("*")
    .in("id", ids);
  if (universityError) return { items: [], error_ru: LOAD_ERROR };
  const profile = toFitProfile(bundle.profile);
  const byId = new Map((universities ?? []).map((row) => [row.id, row]));
  const items = (rows ?? []).flatMap((row) => {
    const university = byId.get(row.university_id);
    if (!university) return [];
    const fitUniversityRow = toFitUniversity(university);
    return [
      {
        id: row.id,
        category: row.category,
        note: row.note,
        created_at: row.created_at,
        university: fitUniversityRow,
        fit: fitUniversity(profile, fitUniversityRow, day),
      },
    ];
  });
  return { items, error_ru: null };
}

export async function loadOpportunities(
  supabase: DbClient,
  userId: string | null,
  filters: OpportunityFilters = {},
  today: Date | string = new Date(),
) {
  const [{ data, error }, bundle] = await Promise.all([
    supabase.from("opportunities").select("*"),
    profileBundle(supabase, userId),
  ]);
  if (error) return { items: [], error_ru: LOAD_ERROR };
  const freeOnly = filters.freeOnly ?? bundle.freeOnly;
  const items = matchOpportunities(
    { grade_or_year: bundle.profile.grade_or_year, path: bundle.profile.path },
    data ?? [],
    { ...filters, freeOnly },
    today,
  );
  return { items, error_ru: null };
}

async function loadExamCatalog(supabase: DbClient): Promise<ExamCatalogItem[]> {
  const { data, error } = await supabase
    .from("exams")
    .select("id, code, name, official_url, source_url, typical_test_dates_note");
  if (error) throw new Error(error.message);
  return data ?? [];
}

async function loadShortlistUniversities(supabase: DbClient, userId: string): Promise<FitUniversity[]> {
  const { data: rows, error } = await supabase
    .from("shortlist")
    .select("university_id")
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
  const ids = (rows ?? []).map((row) => row.university_id);
  if (ids.length === 0) return [];
  const { data, error: universityError } = await supabase.from("universities").select("*").in("id", ids);
  if (universityError) throw new Error(universityError.message);
  return (data ?? []).map(toFitUniversity);
}

export async function loadPrepPlan(
  supabase: DbClient,
  userId: string,
  today: Date | string = new Date(),
): Promise<{ plan: PrepPlan | null; error_ru: string | null }> {
  try {
    const [bundle, universities, exams] = await Promise.all([
      profileBundle(supabase, userId),
      loadShortlistUniversities(supabase, userId),
      loadExamCatalog(supabase),
    ]);
    return {
      plan: prepPlan(toFitProfile(bundle.profile), universities, exams, today),
      error_ru: null,
    };
  } catch (error) {
    console.error("loadPrepPlan", error);
    return { plan: null, error_ru: LOAD_ERROR };
  }
}

export async function loadRoadmap(
  supabase: DbClient,
  userId: string,
  today: Date | string = new Date(),
): Promise<{ tasks: RoadmapTaskDraft[]; error_ru: string | null }> {
  try {
    const [universities, exams] = await Promise.all([
      loadShortlistUniversities(supabase, userId),
      loadExamCatalog(supabase),
    ]);
    return { tasks: buildRoadmap(universities, exams, today), error_ru: null };
  } catch (error) {
    console.error("loadRoadmap", error);
    return { tasks: [], error_ru: LOAD_ERROR };
  }
}

export async function loadTasks(supabase: DbClient, userId: string) {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", userId)
    .order("due_date", { ascending: true, nullsFirst: false });
  if (error) return { items: [], error_ru: LOAD_ERROR };
  return { items: data ?? [], error_ru: null };
}

export async function loadProgress(
  supabase: DbClient,
  userId: string,
  today: Date | string = new Date(),
): Promise<{ progress: ProgressReport | null; error_ru: string | null }> {
  try {
    const [bundle, prep, shortlist, tasks, activity] = await Promise.all([
      profileBundle(supabase, userId),
      loadPrepPlan(supabase, userId, today),
      supabase.from("shortlist").select("id", { count: "exact", head: true }).eq("user_id", userId),
      supabase
        .from("tasks")
        .select("due_date, status, source")
        .eq("user_id", userId),
      supabase.from("activity_days").select("day").eq("user_id", userId),
    ]);
    if (prep.error_ru || shortlist.error || tasks.error || activity.error) {
      return { progress: null, error_ru: LOAD_ERROR };
    }
    return {
      progress: buildProgress({
        profile: bundle.profile,
        prep: prep.plan,
        shortlistCount: shortlist.count ?? 0,
        tasks: tasks.data ?? [],
        activityDays: (activity.data ?? []).map((row) => row.day),
        weeklyGoal: bundle.weeklyGoal,
        today,
      }),
      error_ru: null,
    };
  } catch (error) {
    console.error("loadProgress", error);
    return { progress: null, error_ru: LOAD_ERROR };
  }
}

export async function loadMentorBoard(supabase: DbClient) {
  const [{ data: questions, error: questionError }, { data: answers, error: answerError }] =
    await Promise.all([
      supabase.from("mentor_questions").select("*").order("created_at", { ascending: false }),
      supabase.from("mentor_answers").select("*").order("created_at", { ascending: true }),
    ]);
  if (questionError || answerError) return { questions: [], error_ru: LOAD_ERROR };
  const grouped = new Map<string, NonNullable<typeof answers>>();
  for (const answer of answers ?? []) {
    const list = grouped.get(answer.question_id) ?? [];
    list.push(answer);
    grouped.set(answer.question_id, list);
  }
  return {
    questions: (questions ?? []).map((question) => ({
      ...question,
      answers: grouped.get(question.id) ?? [],
    })),
    error_ru: null,
  };
}

export async function loadAgentHistory(supabase: DbClient, userId: string) {
  const { data, error } = await supabase
    .from("agent_messages")
    .select("id, role, content, parts")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(50);
  if (error) return { messages: [], error_ru: LOAD_ERROR };
  return { messages: data ?? [], error_ru: null };
}

export async function loadImpactStats(supabase: DbClient) {
  const { data, error } = await supabase.rpc("impact_stats");
  if (error || !data) return { stats: null, error_ru: LOAD_ERROR };
  return { stats: data, error_ru: null };
}

export async function loadSettings(supabase: DbClient, userId: string) {
  const bundle = await profileBundle(supabase, userId);
  return {
    weeklyGoal: bundle.weeklyGoal,
    freeOnly: bundle.freeOnly,
    isMentor: bundle.isMentor,
    error_ru: null as string | null,
  };
}

export async function loadExam(supabase: DbClient, code: string) {
  const { data, error } = await supabase.from("exams").select("*").eq("code", code).maybeSingle();
  if (error) return { exam: null, error_ru: LOAD_ERROR };
  return { exam: data, error_ru: null };
}

export type DataClient = SupabaseClient<Database>;
