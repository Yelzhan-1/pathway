// src/app/(app)/profile/page.tsx
import { ProfileScreen } from '@/components/pathway/profile/ProfileScreen';
import type { ProfileData } from '@/types/pathway';

export default async function ProfilePage() {
  // TODO: build from profile row. Field ids MUST match onboarding step ids (gpa, budget, intake …) — dashboard links to /profile#<id>.
  const data: ProfileData = {
    name: 'Имя Фамилия', city: null, meta: null, email: 'user@example.com',
    strength: { percent: 0, levelLabel: 'Заполни профиль', missing: [] },
    cv: { status: 'none', percent: 0, updated: null },
    sections: [],
  };
  return <ProfileScreen data={data} docs={null} />;
}
