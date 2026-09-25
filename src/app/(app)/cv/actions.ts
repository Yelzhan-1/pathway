"use server";

import { revalidatePath } from "next/cache";

import type { Json } from "@/lib/database.types";
import { getCurrentProfile } from "@/lib/profile/queries";
import { activitiesSchema, cvSchema } from "@/lib/profile/schemas";
import { firstZodMessage } from "@/lib/profile/zod-error";
import { strings } from "@/lib/strings";

export type ProfileActionResult = { error: string } | { error: null };

export async function saveCvAction(raw: unknown): Promise<ProfileActionResult> {
  const { user, supabase } = await getCurrentProfile();
  const parsed = cvSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: firstZodMessage(parsed.error) };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ cv: parsed.data as Json })
    .eq("id", user.id);

  if (error) {
    return { error: strings.cv.saveError };
  }

  revalidatePath("/cv");
  revalidatePath("/profile");
  return { error: null };
}

export async function saveActivitiesAction(
  raw: unknown,
): Promise<ProfileActionResult> {
  const { user, supabase } = await getCurrentProfile();
  const parsed = activitiesSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: firstZodMessage(parsed.error) };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ activities: parsed.data as Json })
    .eq("id", user.id);

  if (error) {
    return { error: strings.cv.saveError };
  }

  revalidatePath("/cv");
  revalidatePath("/profile");
  return { error: null };
}
