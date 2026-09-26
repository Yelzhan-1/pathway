"use server";

import { revalidatePath } from "next/cache";

import { getActionContext } from "./context";
import { syncRoadmapForUser } from "./mutate";
import { fail, type ActionResult } from "./result";

export async function syncRoadmapTasks(): Promise<
  ActionResult<{ inserted: number; updated: number; unchanged: number }>
> {
  const ctx = await getActionContext();
  if (!ctx.ok) return fail("Войдите в аккаунт.");
  const result = await syncRoadmapForUser(ctx.supabase, ctx.userId);
  if (result.ok) {
    revalidatePath("/roadmap");
    revalidatePath("/tasks");
    revalidatePath("/dashboard");
  }
  return result;
}
