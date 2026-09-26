"use server";

import { revalidatePath } from "next/cache";

import { getActionContext } from "./context";
import {
  addToShortlistForUser,
  changeShortlistCategoryForUser,
  removeFromShortlistForUser,
} from "./mutate";
import { fail, type ActionResult } from "./result";

function denied<T>(): ActionResult<T> {
  return fail("Войдите в аккаунт.");
}

export async function addToShortlist(input: unknown): Promise<ActionResult<{ universityId: string }>> {
  const ctx = await getActionContext();
  if (!ctx.ok) return denied();
  const result = await addToShortlistForUser(ctx.supabase, ctx.userId, input);
  if (result.ok) {
    revalidatePath("/universities");
    revalidatePath("/dashboard");
  }
  return result;
}

export async function removeFromShortlist(
  input: unknown,
): Promise<ActionResult<{ universityId: string }>> {
  const ctx = await getActionContext();
  if (!ctx.ok) return denied();
  const result = await removeFromShortlistForUser(ctx.supabase, ctx.userId, input);
  if (result.ok) {
    revalidatePath("/universities");
    revalidatePath("/dashboard");
  }
  return result;
}

export async function changeShortlistCategory(
  input: unknown,
): Promise<ActionResult<{ universityId: string }>> {
  const ctx = await getActionContext();
  if (!ctx.ok) return denied();
  const result = await changeShortlistCategoryForUser(ctx.supabase, ctx.userId, input);
  if (result.ok) {
    revalidatePath("/universities");
    revalidatePath("/dashboard");
  }
  return result;
}
