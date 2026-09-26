'use client';
import { useRouter } from 'next/navigation';
import { OnboardingFlow } from '@/components/pathway/onboarding/OnboardingFlow';
import type { OnboardingAnswers, OnboardingData } from '@/types/pathway';
// import { saveOnboarding } from './actions'; ← server action ('use server'), also call it per step to persist progress

export function OnboardingClient({ data, initialAnswers, initialStep }: { data: OnboardingData; initialAnswers: OnboardingAnswers; initialStep: number }) {
  const router = useRouter();
  return (
    <OnboardingFlow data={data} initialAnswers={initialAnswers} initialStep={initialStep}
      onExit={() => router.push('/dashboard')}
      onFinish={async (answers) => { /* await saveOnboarding(answers); */ void answers; router.push('/dashboard'); }} />
  );
}
