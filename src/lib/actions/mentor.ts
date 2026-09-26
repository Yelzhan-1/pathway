"use server";

import { getActionContext } from "./context";
import { postMentorAnswerForUser, postMentorQuestionForUser } from "./mutate";
import { fail, type ActionResult } from "./result";

export async function postMentorQuestion(input: unknown): Promise<ActionResult<{ id: string }>> {
  const ctx = await getActionContext();
  if (!ctx.ok) return fail("Войдите в аккаунт.");
  return postMentorQuestionForUser(ctx.supabase, ctx.userId, input);
}

export async function postMentorAnswer(input: unknown): Promise<ActionResult<{ id: string }>> {
  const ctx = await getActionContext();
  if (!ctx.ok) return fail("Войдите в аккаунт.");
  return postMentorAnswerForUser(ctx.supabase, ctx.userId, input);
}
