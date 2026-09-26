// src/app/onboarding/page.tsx — no app shell (focus mode).
import { OnboardingClient } from './OnboardingClient';
import { ONBOARDING } from './steps';

export default async function OnboardingPage() {
  // TODO: load saved answers to resume: const saved = await getOnboardingAnswers(userId)
  return <OnboardingClient data={ONBOARDING} initialAnswers={{}} initialStep={0} />;
}
