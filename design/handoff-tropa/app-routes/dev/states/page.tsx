// src/app/dev/states/page.tsx — visual QA gallery (example / empty / loading). NOT in production.
import { notFound } from 'next/navigation';
import { DashboardScreen } from '@/components/pathway/dashboard/DashboardScreen';
import { ProfileStrengthRing } from '@/components/pathway/dashboard/ProfileStrengthRing';
import { PopularUniversities } from '@/components/pathway/dashboard/PopularUniversities';
import { DeadlinesTickets } from '@/components/pathway/dashboard/DeadlinesTickets';
import { DocumentsBackpack } from '@/components/pathway/dashboard/DocumentsBackpack';
import { ErrorState } from '@/components/pathway/primitives/States';
import { emptyDashboard, exampleDashboard } from '@/fixtures/tropa';

export default async function StatesGallery({ searchParams }: { searchParams: Promise<{ v?: string }> }) {
  if (process.env.NODE_ENV === 'production') notFound(); // fixtures never reach prod
  const { v } = await searchParams;
  if (v === 'example') return <div className="p-6"><DashboardScreen data={exampleDashboard} /></div>;
  if (v === 'empty') return <div className="p-6"><DashboardScreen data={emptyDashboard} /></div>;
  return (
    <div className="mx-auto grid max-w-[1100px] gap-4 p-8 md:grid-cols-3">
      <p className="md:col-span-3 text-[14px] font-bold">?v=example · ?v=empty — полные дашборды. Ниже — загрузка и ошибка.</p>
      <ProfileStrengthRing data={null} loading />
      <PopularUniversities unis={null} loading />
      <DeadlinesTickets items={null} today="2026-09-26" loading />
      <DocumentsBackpack docs={null} loading />
      <div className="md:col-span-2"><ErrorState title="Не получилось загрузить вузы." /></div>
    </div>
  );
}
