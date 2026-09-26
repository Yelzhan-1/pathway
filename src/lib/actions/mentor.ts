"use server";

import { revalidatePath } from "next/cache";

import { getActionContext } from "./context";
import { postMentorAnswerForUser, postMentorQuestionForUser } from "./mutate";
import { fail, type ActionResult } from "./result";

function refreshMentors() {
  revalidatePath("/mentors");
}

export async function postMentorQuestion(input: unknown): Promise<ActionResult<{ id: string }>> {
  const ctx = await getActionContext();
  if (!ctx.ok) return fail("Войдите в аккаунт.");
  const result = await postMentorQuestionForUser(ctx.supabase, ctx.userId, input);
  if (result.ok) refreshMentors();
  return result;
}

export async function postMentorAnswer(input: unknown): Promise<ActionResult<{ id: string }>> {
  const ctx = await getActionContext();
  if (!ctx.ok) return fail("Войдите в аккаунт.");
  const result = await postMentorAnswerForUser(ctx.supabase, ctx.userId, input);
  if (result.ok) refreshMentors();
  return result;
}
