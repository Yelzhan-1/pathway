import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/database.types";
import { toUtcDateString } from "@/lib/matching/dates";

export type DbClient = SupabaseClient<Database>;

/** Records that the user did something today. Safe to call repeatedly. */
export async function markActivity(
  supabase: DbClient,
  userId: string,
  day: string = toUtcDateString(new Date()),
): Promise<void> {
  const { error } = await supabase
    .from("activity_days")
    .upsert({ user_id: userId, day }, { onConflict: "user_id,day" });
  if (error) {
    console.error("markActivity", error.message);
  }
}
