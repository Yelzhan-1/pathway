import { createClient } from "@/lib/supabase/server";

import type { UniversityFilters } from "@/lib/matching/types";
import type { OpportunityFilters } from "@/lib/opportunities/match";

import {
  loadImpactStats,
  loadMentorBoard,
  loadOpportunities,
  loadPrepPlan,
  loadProgress,
  loadRoadmap,
  loadSettings,
  loadShortlist,
  loadTasks,
  loadUniversities,
  loadUniversity,
} from "./load";

const SIGN_IN = "Войдите в аккаунт.";

async function session() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, userId: user?.id ?? null };
}

export async function getUniversities(filters: UniversityFilters = {}) {
  const { supabase, userId } = await session();
  return loadUniversities(supabase, userId, filters);
}

export async function getUniversity(slug: string) {
  const { supabase, userId } = await session();
  return loadUniversity(supabase, userId, slug);
}

export async function getShortlist() {
  const { supabase, userId } = await session();
  if (!userId) return { items: [], error_ru: SIGN_IN };
  return loadShortlist(supabase, userId);
}

export async function getOpportunities(filters: OpportunityFilters = {}) {
  const { supabase, userId } = await session();
  return loadOpportunities(supabase, userId, filters);
}

export async function getPrepPlan() {
  const { supabase, userId } = await session();
  if (!userId) return { plan: null, error_ru: SIGN_IN };
  return loadPrepPlan(supabase, userId);
}

export async function getRoadmap() {
  const { supabase, userId } = await session();
  if (!userId) return { tasks: [], error_ru: SIGN_IN };
  return loadRoadmap(supabase, userId);
}

export async function getTasks() {
  const { supabase, userId } = await session();
  if (!userId) return { items: [], error_ru: SIGN_IN };
  return loadTasks(supabase, userId);
}

export async function getProgress() {
  const { supabase, userId } = await session();
  if (!userId) return { progress: null, error_ru: SIGN_IN };
  return loadProgress(supabase, userId);
}

export async function getMentorBoard() {
  const { supabase, userId } = await session();
  if (!userId) return { questions: [], error_ru: SIGN_IN };
  return loadMentorBoard(supabase);
}

export async function getImpactStats() {
  const { supabase, userId } = await session();
  if (!userId) return { stats: null, error_ru: SIGN_IN };
  return loadImpactStats(supabase);
}

export async function getSettings() {
  const { supabase, userId } = await session();
  if (!userId) {
    return { weeklyGoal: null, freeOnly: false, isMentor: false, error_ru: SIGN_IN };
  }
  return loadSettings(supabase, userId);
}
