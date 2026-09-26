"use server";

import { revalidatePath } from "next/cache";

import { addPathPlanForUser } from "./mutate";
import { getActionContext } from "./context";
import { fail, type ActionResult } from "./result";

function denied<T>(): ActionResult<T> {
  return fail("Войдите в аккаунт.");
}

export async function addPathPlan(
  input: unknown,
): Promise<ActionResult<{ inserted: number; unchanged: number }>> {
  const ctx = await getActionContext();
  if (!ctx.ok) return denied();
  const result = await addPathPlanForUser(ctx.supabase, ctx.userId, input);
  if (result.ok) {
    revalidatePath("/tasks");
    revalidatePath("/roadmap");
    revalidatePath("/dashboard");
    revalidatePath("/universities", "layout");
  }
  return result;
}
