"use server";

import { revalidatePath } from "next/cache";

import { getActionContext } from "./context";
import { submitFeedbackForUser } from "./mutate";
import { fail, type ActionResult } from "./result";

export async function submitFeedback(input: unknown): Promise<ActionResult<{ id: string }>> {
  const ctx = await getActionContext();
  if (!ctx.ok) return fail("Войдите в аккаунт.");
  const result = await submitFeedbackForUser(ctx.supabase, ctx.userId, input);
  if (result.ok) revalidatePath("/impact");
  return result;
}
