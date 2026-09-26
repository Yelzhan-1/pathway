import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, Json } from "@/lib/database.types";

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

export async function updateProfileOptimistic(
  supabase: ProfileClient,
  userId: string,
  expectedUpdatedAt: string | null,
  patch: { cv?: Json; activities?: Json },
): Promise<OptimisticUpdateResult> {
  let query = supabase.from("profiles").update(patch).eq("id", userId);
  if (expectedUpdatedAt) {
    query = query.eq("updated_at", expectedUpdatedAt);
  }

  const { data, error } = await query
    .select("cv, activities, updated_at")
    .maybeSingle();

  if (error) return { ok: false, kind: "error" };
  if (data) return { ok: true, updatedAt: data.updated_at };

  const { data: current, error: fetchError } = await supabase
    .from("profiles")
    .select("cv, activities, updated_at")
    .eq("id", userId)
    .maybeSingle();

  if (fetchError || !current) return { ok: false, kind: "error" };
  return {
    ok: false,
    kind: "conflict",
    updatedAt: current.updated_at,
    cv: current.cv,
    activities: current.activities,
  };
}
