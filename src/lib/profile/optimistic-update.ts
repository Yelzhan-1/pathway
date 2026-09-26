import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, Json } from "@/lib/database.types";
import { mergePatch } from "@/lib/hooks/autosave-patch";
import { parseCv } from "@/lib/profile/parse";
import { cvSchema } from "@/lib/profile/schemas";

type ProfileClient = SupabaseClient<Database>;

export type OptimisticUpdateResult =
  | { ok: true; updatedAt: string }
  | {
      ok: false;
      kind: "conflict";
      updatedAt: string;
      cv: Json;
      activities: Json;
    }
  | { ok: false; kind: "error" };

function conflict(row: {
  updated_at: string;
  cv: Json;
  activities: Json;
}): OptimisticUpdateResult {
  return {
    ok: false,
    kind: "conflict",
    updatedAt: row.updated_at,
    cv: row.cv,
    activities: row.activities,
  };
}

export async function updateProfileOptimistic(
  supabase: ProfileClient,
  userId: string,
  expectedUpdatedAt: string,
  patch: { cv?: Record<string, unknown>; activities?: Json },
): Promise<OptimisticUpdateResult> {
  const { data: current, error: readError } = await supabase
    .from("profiles")
    .select("cv, activities, updated_at")
    .eq("id", userId)
    .maybeSingle();

  if (readError || !current) return { ok: false, kind: "error" };
  if (current.updated_at !== expectedUpdatedAt) return conflict(current);

  const update: { cv?: Json; activities?: Json } = {};
  if (patch.cv && Object.keys(patch.cv).length > 0) {
    const merged = mergePatch(parseCv(current.cv), patch.cv);
    const parsed = cvSchema.safeParse(merged);
    if (!parsed.success) return { ok: false, kind: "error" };
    update.cv = parsed.data as Json;
  }
  if (patch.activities !== undefined) update.activities = patch.activities;

  if (Object.keys(update).length === 0) {
    return { ok: true, updatedAt: current.updated_at };
  }

  const { data, error } = await supabase
    .from("profiles")
    .update(update)
    .eq("id", userId)
    .eq("updated_at", expectedUpdatedAt)
    .select("cv, activities, updated_at")
    .maybeSingle();

  if (error) return { ok: false, kind: "error" };
  if (data) return { ok: true, updatedAt: data.updated_at };

  const { data: fresh, error: fetchError } = await supabase
    .from("profiles")
    .select("cv, activities, updated_at")
    .eq("id", userId)
    .maybeSingle();

  if (fetchError || !fresh) return { ok: false, kind: "error" };
  return conflict(fresh);
}
