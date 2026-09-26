"use server";

import { revalidatePath } from "next/cache";

import { getActionContext } from "./context";
import { createTaskForUser, deleteTaskForUser, updateTaskStatusForUser } from "./mutate";
import { fail, type ActionResult } from "./result";

function denied<T>(): ActionResult<T> {
  return fail("Войдите в аккаунт.");
}

function refreshTasks() {
  revalidatePath("/tasks");
  revalidatePath("/roadmap");
  revalidatePath("/dashboard");
}

export async function createTask(input: unknown): Promise<ActionResult<{ id: string }>> {
  const ctx = await getActionContext();
  if (!ctx.ok) return denied();
  const result = await createTaskForUser(ctx.supabase, ctx.userId, input, "manual");
  if (result.ok) refreshTasks();
  return result;
}

export async function updateTaskStatus(input: unknown): Promise<ActionResult<{ id: string }>> {
  const ctx = await getActionContext();
  if (!ctx.ok) return denied();
  const result = await updateTaskStatusForUser(ctx.supabase, ctx.userId, input);
  if (result.ok) refreshTasks();
  return result;
}

export async function deleteTask(input: unknown): Promise<ActionResult<{ id: string }>> {
  const ctx = await getActionContext();
  if (!ctx.ok) return denied();
  const result = await deleteTaskForUser(ctx.supabase, ctx.userId, input);
  if (result.ok) refreshTasks();
  return result;
}
