"use server";

import { revalidatePath } from "next/cache";

import { markActivity } from "./activity";
import { getActionContext } from "./context";
import { setFreeOnlyForUser, setWeeklyGoalForUser } from "./mutate";
import { fail, ok, type ActionResult } from "./result";

export async function setWeeklyGoal(
  input: unknown,
): Promise<ActionResult<{ weeklyGoal: number | null }>> {
  const ctx = await getActionContext();
  if (!ctx.ok) return fail("Войдите в аккаунт.");
  const result = await setWeeklyGoalForUser(ctx.supabase, ctx.userId, input);
  if (result.ok) revalidatePath("/dashboard");
  return result;
}

export async function setFreeOnly(input: unknown): Promise<ActionResult<{ freeOnly: boolean }>> {
  const ctx = await getActionContext();
  if (!ctx.ok) return fail("Войдите в аккаунт.");
  const result = await setFreeOnlyForUser(ctx.supabase, ctx.userId, input);
  if (result.ok) {
    revalidatePath("/", "layout");
    revalidatePath("/dashboard");
    revalidatePath("/universities", "layout");
    revalidatePath("/opportunities");
    revalidatePath("/favorites");
    revalidatePath("/compare");
  }
  return result;
}

export async function markActivityAction(): Promise<ActionResult<null>> {
  const ctx = await getActionContext();
  if (!ctx.ok) return fail("Войдите в аккаунт.");
  await markActivity(ctx.supabase, ctx.userId);
  return ok(null);
}
