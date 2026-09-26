"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { Json } from "@/lib/database.types";
import {
  canCompleteOnboarding,
  destinationAfterStep,
  getFirstUnansweredStep,
  isSkippableOnboardingStep,
  nextOnboardingCursor,
  TOTAL_ONBOARDING_STEPS,
} from "@/lib/profile/onboarding-steps";
import { ACADEMIC_EXAM_CODES, LANGUAGE_EXAM_CODES } from "@/lib/profile/exam-ranges";
import { parseExams, replaceExamGroup } from "@/lib/profile/parse";
import {
  budgetStepSchema,
  cityStepSchema,
  countriesStepSchema,
  englishStepSchema,
  examsStepSchema,
  gpaStepSchema,
  intakeYearStepSchema,
  majorStepSchema,
  statusStepSchema,
} from "@/lib/profile/schemas";
import { getCurrentProfile } from "@/lib/profile/queries";
import { firstZodMessage } from "@/lib/profile/zod-error";
import { strings } from "@/lib/strings";

export type ProfileActionResult = { error: string } | { error: null };

function revalidateProfilePages() {
  revalidatePath("/onboarding");
  revalidatePath("/dashboard");
  revalidatePath("/profile");
  revalidatePath("/cv");
}

export async function saveOnboardingStepAction(
  step: number,
  raw: unknown,
): Promise<ProfileActionResult> {
  const { user, profile, supabase } = await getCurrentProfile();
  if (profile.onboarding_completed) {
    redirect("/dashboard");
  }

  const allowed = getFirstUnansweredStep(profile);
  if (!Number.isInteger(step) || step < 1 || step > 9 || step > allowed) {
    return { error: strings.common.errorGeneric };
  }

  const patch: {
    path?: typeof profile.path;
    grade_or_year?: string | null;
    city?: string | null;
    intended_major?: string | null;
    target_countries?: string[];
    budget_usd?: number | null;
    needs_scholarship?: boolean;
    english_level?: string | null;
    exams?: Json;
    gpa?: number | null;
    gpa_scale?: number | null;
    intake_year?: number | null;
    onboarding_step: number;
  } = {
    onboarding_step: nextOnboardingCursor(profile.onboarding_step, step),
  };

  switch (step) {
    case 1: {
      const parsed = statusStepSchema.safeParse(raw);
      if (!parsed.success) return { error: firstZodMessage(parsed.error) };
      patch.path = parsed.data.path;
      patch.grade_or_year = parsed.data.grade_or_year;
      break;
    }
    case 2: {
      const parsed = cityStepSchema.safeParse(raw);
      if (!parsed.success) return { error: firstZodMessage(parsed.error) };
      patch.city = parsed.data.city;
      break;
    }
    case 3: {
      const parsed = majorStepSchema.safeParse(raw);
      if (!parsed.success) return { error: firstZodMessage(parsed.error) };
      patch.intended_major = parsed.data.intended_major;
      break;
    }
    case 4: {
      const parsed = countriesStepSchema.safeParse(raw);
      if (!parsed.success) return { error: firstZodMessage(parsed.error) };
      patch.target_countries = parsed.data.target_countries;
      break;
    }
    case 5: {
      const parsed = budgetStepSchema.safeParse(raw);
      if (!parsed.success) return { error: firstZodMessage(parsed.error) };
      patch.budget_usd = parsed.data.budget_usd;
      patch.needs_scholarship = parsed.data.needs_scholarship;
      break;
    }
    case 6: {
      const parsed = englishStepSchema.safeParse(raw);
      if (!parsed.success) return { error: firstZodMessage(parsed.error) };
      patch.english_level = parsed.data.english_level;
      patch.exams = replaceExamGroup(
        profile.exams,
        parseExams(parsed.data.exams as Json),
        LANGUAGE_EXAM_CODES,
      ) as Json;
      break;
    }
    case 7: {
      const parsed = examsStepSchema.safeParse(raw);
      if (!parsed.success) return { error: firstZodMessage(parsed.error) };
      patch.exams = replaceExamGroup(
        profile.exams,
        parseExams(parsed.data.exams as Json),
        ACADEMIC_EXAM_CODES,
      ) as Json;
      break;
    }
    case 8: {
      const parsed = gpaStepSchema.safeParse(raw);
      if (!parsed.success) return { error: firstZodMessage(parsed.error) };
      patch.gpa = parsed.data.gpa;
      patch.gpa_scale = parsed.data.gpa_scale;
      break;
    }
    case 9: {
      const parsed = intakeYearStepSchema.safeParse(raw);
      if (!parsed.success) return { error: firstZodMessage(parsed.error) };
      patch.intake_year = parsed.data.intake_year;
      break;
    }
    default:
      return { error: strings.common.errorGeneric };
  }

  const { error } = await supabase
    .from("profiles")
    .update(patch)
    .eq("id", user.id);

  if (error) {
    return { error: strings.common.errorGeneric };
  }

  revalidateProfilePages();
  redirect(`/onboarding?step=${destinationAfterStep(profile.onboarding_step, step)}`);
}

export async function skipOnboardingStepAction(
  step: number,
): Promise<ProfileActionResult> {
  const { user, profile, supabase } = await getCurrentProfile();
  if (profile.onboarding_completed) {
    redirect("/dashboard");
  }

  const allowed = getFirstUnansweredStep(profile);
  if (
    !Number.isInteger(step) ||
    step < 1 ||
    step > 9 ||
    step > allowed ||
    !isSkippableOnboardingStep(step)
  ) {
    return { error: strings.common.errorGeneric };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      onboarding_step: nextOnboardingCursor(profile.onboarding_step, step),
    })
    .eq("id", user.id);

  if (error) {
    return { error: strings.common.errorGeneric };
  }

  revalidateProfilePages();
  redirect(`/onboarding?step=${destinationAfterStep(profile.onboarding_step, step)}`);
}

export async function completeOnboardingAction(): Promise<ProfileActionResult> {
  const { user, profile, supabase } = await getCurrentProfile();
  if (profile.onboarding_completed) {
    redirect("/dashboard");
  }

  if (!canCompleteOnboarding(profile)) {
    return { error: strings.onboarding.completeBlocked };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      onboarding_completed: true,
      onboarding_step: Math.max(profile.onboarding_step, TOTAL_ONBOARDING_STEPS),
    })
    .eq("id", user.id);

  if (error) {
    return { error: strings.common.errorGeneric };
  }

  revalidateProfilePages();
  redirect("/dashboard");
}
