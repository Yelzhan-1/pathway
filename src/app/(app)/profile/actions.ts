"use server";

import { revalidatePath } from "next/cache";

import type { Json } from "@/lib/database.types";
import { getCurrentProfile } from "@/lib/profile/queries";
import { profileFormSchema } from "@/lib/profile/schemas";
import { firstZodMessage } from "@/lib/profile/zod-error";
import { strings } from "@/lib/strings";

export type ProfileActionResult = { error: string } | { error: null };

export async function updateProfileAction(
  raw: unknown,
): Promise<ProfileActionResult> {
  const { user, supabase } = await getCurrentProfile();
  const parsed = profileFormSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: firstZodMessage(parsed.error) };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.full_name,
      path: parsed.data.path,
      grade_or_year: parsed.data.grade_or_year,
      city: parsed.data.city,
      intended_major: parsed.data.intended_major,
      target_countries: parsed.data.target_countries,
      budget_usd: parsed.data.budget_usd,
      needs_scholarship: parsed.data.needs_scholarship,
      english_level: parsed.data.english_level,
      exams: parsed.data.exams as Json,
      gpa: parsed.data.gpa,
      gpa_scale: parsed.data.gpa == null ? null : parsed.data.gpa_scale,
      intake_year: parsed.data.intake_year,
    })
    .eq("id", user.id);

  if (error) {
    return { error: strings.profile.saveError };
  }

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  revalidatePath("/cv");
  revalidatePath("/onboarding");
  return { error: null };
}
