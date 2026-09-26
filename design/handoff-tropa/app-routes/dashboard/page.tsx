// src/app/(app)/dashboard/page.tsx — Server Component. Only JSON props go to the client.
import { DashboardScreen } from '@/components/pathway/dashboard/DashboardScreen';
import type { DashboardData, DocItem, MissingField, RoadStep } from '@/types/pathway';
// import { getProfile, getCvStatus, listUniversities } from '@/lib/db';

export default async function DashboardPage() {
  // ---- NOW (block 2): real data ----
  // const profile = await getProfile(userId);          // onboarding answers + fields
  // const cv = await getCvStatus(userId);              // { status, percent }
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Almaty' }).format(new Date()); // YYYY-MM-DD in user TZ
  const completeness = 0;            // TODO: filledFields / totalFields * 100 (same formula as onboarding summary)
  const missing: MissingField[] = []; // TODO: fields with value == null → { id, label, gain, href: `/profile#${id}` }
  const onboarded = false;           // TODO: profile.onboardingCompletedAt != null

  const road: RoadStep[] = onboarded
    ? [
        { id: 'profile', title: 'Профиль', status: completeness >= 80 ? 'done' : 'current', href: '/profile', progress: null },
        { id: 'cv', title: 'Резюме', status: 'locked', href: '/cv' }, // TODO: 'done' when cv.status === 'ready', 'current' when profile done
        { id: 'unis', title: 'Выбери вузы', status: 'locked' },        // block 3 makes this real
        { id: 'exams', title: 'Экзамены', status: 'locked' },
        { id: 'apply', title: 'Заявки', status: 'locked' },
      ]
    : [{ id: 'profile', title: 'Заполни профиль', status: 'current', meta: '10 вопросов · 3 минуты', href: '/onboarding' }];

  const docs: DocItem[] | null = onboarded
    ? [
        { id: 'cv', title: 'Резюме', status: 'todo', href: '/cv' },            // TODO: from cv.status
        { id: 'transcript', title: 'Транскрипт', status: 'todo' },
        // include only if profile.exams has IELTS/TOEFL:
        // { id: 'english', title: 'IELTS', status: 'todo' },
        { id: 'motivation', title: 'Мотив. письмо', status: 'todo' },
      ]
    : null;

  const data: DashboardData = {
    today,
    firstName: 'Имя', // TODO: profile.firstName
    headline: onboarded ? 'Профиль почти готов — добавь недостающие поля.' : 'Начнём с профиля — это 3 минуты, и дорога откроется.',
    road, roadFinish: onboarded ? 'Финиш · подача заявок' : null,
    strength: onboarded ? { percent: completeness, levelLabel: missing.length ? `до уровня «Готов» — ${missing.length} поля` : 'Профиль заполнен', missing } : null,
    docs,
    // ---- LATER → render empty states now ----
    stats: null,          // block 3 (views/favorites/comparisons)
    popular: null,        // block 3 — OR already now: (await listUniversities({ limit: 3, orderBy: 'rank' })).map(toUniCard)
    popularTotal: undefined,
    checkOptions: null,   // block 3 matching
    chances: null,        // block 3
    streak: null,         // block 4
    deadlines: null,      // block 4
    opportunities: null,  // block 4
    ai: null,             // block 5
  };
  return <DashboardScreen data={data} />;
}
