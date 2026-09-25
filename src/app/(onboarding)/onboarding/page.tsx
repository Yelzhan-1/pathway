import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { resolveRequestedStep } from "@/lib/profile/onboarding-steps";
import { getCatalogCountries, getCurrentProfile } from "@/lib/profile/queries";
import { strings } from "@/lib/strings";

export const metadata: Metadata = {
  title: `${strings.onboarding.title} — ${strings.app.name}`,
};

export default async function OnboardingPage({
  searchParams,
}: PageProps<"/onboarding">) {
  const { profile } = await getCurrentProfile();
  const countries = await getCatalogCountries();
  const params = await searchParams;
  const step = resolveRequestedStep(profile, params.step);
  const requested = typeof params.step === "string" ? params.step : undefined;

  if (requested !== String(step)) {
    redirect(`/onboarding?step=${step}`);
  }

  return (
    <OnboardingWizard profile={profile} step={step} countries={countries} />
  );
}
