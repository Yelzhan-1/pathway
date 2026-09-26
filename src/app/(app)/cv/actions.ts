"use server";

import { revalidatePath } from "next/cache";

import type { Json } from "@/lib/database.types";
import { parseActivities, parseCv } from "@/lib/profile/parse";
import { updateProfileOptimistic } from "@/lib/profile/optimistic-update";
import { getCurrentProfile } from "@/lib/profile/queries";
import { activitiesSchema, cvSchema } from "@/lib/profile/schemas";
import type { Activity, Cv } from "@/lib/profile/types";
import { firstZodMessage } from "@/lib/profile/zod-error";
import { strings } from "@/lib/strings";

export type CvAutosaveResult<T> =
  | { error: null; updatedAt: string; conflict?: undefined }
  | { error: string; updatedAt?: undefined; conflict?: undefined }
  | {
      error: null;
      conflict: { updatedAt: string; data: T };
      updatedAt?: undefined;
    };

export async function saveCvAction(
  raw: unknown,
  expectedUpdatedAt: string | null,
): Promise<CvAutosaveResult<Cv>> {
  const { user, supabase } = await getCurrentProfile();
  const parsed = cvSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: firstZodMessage(parsed.error) };
  }

  const result = await updateProfileOptimistic(
    supabase,
    user.id,
    expectedUpdatedAt,
    { cv: parsed.data as Json },
  );

  if (result.ok) {
    revalidatePath("/cv");
    revalidatePath("/profile");
    return { error: null, updatedAt: result.updatedAt };
  }
  if (result.kind === "conflict") {
    return {
      error: null,
      conflict: {
        updatedAt: result.updatedAt,
        data: parseCv(result.cv),
      },
    };
  }
  return { error: strings.cv.saveError };
}

export async function saveActivitiesAction(
  raw: unknown,
  expectedUpdatedAt: string | null,
): Promise<CvAutosaveResult<Activity[]>> {
  const { user, supabase } = await getCurrentProfile();
  const parsed = activitiesSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: firstZodMessage(parsed.error) };
  }

  const result = await updateProfileOptimistic(
    supabase,
    user.id,
    expectedUpdatedAt,
    { activities: parsed.data as Json },
  );

  if (result.ok) {
    revalidatePath("/cv");
    revalidatePath("/profile");
    return { error: null, updatedAt: result.updatedAt };
  }
  if (result.kind === "conflict") {
    return {
      error: null,
      conflict: {
        updatedAt: result.updatedAt,
        data: parseActivities(result.activities),
      },
    };
  }
  return { error: strings.cv.saveError };
}
