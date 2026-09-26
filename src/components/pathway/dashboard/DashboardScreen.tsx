import type { DashboardData } from '@/types/pathway';
import { longDate } from '@/lib/format';
import { Display } from '../ui/tropa';
import { MapScenery, ProgressRoad } from './ProgressRoad';
import { StatTiles } from './StatTiles';
import { ProfileStrengthRing } from './ProfileStrengthRing';
import { StreakCard } from './StreakCard';
import { PopularUniversities } from './PopularUniversities';
import { CheckChancesForm } from './CheckChancesForm';
import { ChancesColumns } from './ChancesColumns';
import { DeadlinesTickets } from './DeadlinesTickets';
import { OpportunitiesList } from './OpportunitiesList';
import { DocumentsBackpack } from './DocumentsBackpack';
import { AiBuddyCard } from './AiBuddyCard';

/**
 * Dashboard «Тропа» (content only — wrap in <AppShell active="home">).
 * ≥lg: [main | 340px rail]. <lg: one column; wrappers use `contents` so `order-*` interleaves both columns on phones.
 * Mobile order: hero → strength → check → popular → streak → chances → deadlines → docs → AI → opportunities.
 */
export function DashboardScreen({ data }: { data: DashboardData }) {
  const single = data.road.length === 1;
  return (
    <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
      <div className="contents lg:flex lg:min-w-0 lg:flex-col lg:gap-4">
        <section aria-labelledby="hero-h" className="relative order-1 overflow-hidden rounded-[var(--radius-hero)] ring-1 ring-border lg:order-none">
          <MapScenery fog={single} />
          <div className="relative z-10 px-5 pt-5 lg:absolute lg:left-7 lg:top-6 lg:max-w-[440px] lg:p-0">
            <p className="text-[14px] font-bold text-forest-700 dark:text-forest-300">{longDate(data.today)}</p>
            <Display as="h1" id="hero-h" className="mt-1 text-[26px] font-bold leading-[1.1] sm:text-[30px] lg:text-[34px]">Привет, {data.firstName}!</Display>
            <p className="mt-2 text-[15px] font-semibold text-ink-2 lg:text-[15.5px]">{data.headline}</p>
          </div>
          <div className="relative z-10 px-5 pt-4 lg:absolute lg:left-7 lg:top-[164px] lg:p-0">
            <StatTiles tiles={data.stats} />
          </div>
          <ProgressRoad steps={data.road} finish={data.roadFinish} className="relative px-5 pb-5 pt-5 lg:p-0" />
        </section>

        <div className="contents lg:grid lg:grid-cols-[1.25fr_1fr] lg:gap-4">
          <div className="order-4 min-w-0 lg:order-none"><PopularUniversities unis={data.popular} total={data.popularTotal} /></div>
          <div className="order-3 lg:order-none"><CheckChancesForm options={data.checkOptions} /></div>
        </div>
        <div className="contents lg:grid lg:grid-cols-3 lg:gap-4">
          <div className="order-6 lg:order-none"><ChancesColumns data={data.chances} /></div>
          <div className="order-7 lg:order-none"><DeadlinesTickets items={data.deadlines} today={data.today} /></div>
          <div className="order-10 lg:order-none"><OpportunitiesList items={data.opportunities} /></div>
        </div>
      </div>

      <div className="contents lg:flex lg:flex-col lg:gap-4">
        <div className="order-2 lg:order-none"><ProfileStrengthRing data={data.strength} /></div>
        <div className="order-5 lg:order-none"><StreakCard data={data.streak} /></div>
        <div className="order-9 lg:order-none"><AiBuddyCard data={data.ai} /></div>
        <div className="order-8 lg:order-none"><DocumentsBackpack docs={data.docs} /></div>
      </div>
    </div>
  );
}
