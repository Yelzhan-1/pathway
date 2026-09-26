import type { DashboardData } from '@/types/pathway';
import { longDate } from '@/lib/format';
import { Button, Display } from '../ui/tropa';
import { MapScenery, ProgressRoad } from './ProgressRoad';
import { WeeklyTasksCard } from './WeeklyTasksCard';
import { DeadlinesTickets } from './DeadlinesTickets';
import { ShortlistSummaryCard } from './ShortlistSummaryCard';
import { FeedbackDisclosure } from './FeedbackDisclosure';

/**
 * Dashboard «Тропа» (content only — wrap in <AppShell active="home">).
 * 4 blocks, ~1.5 mobile screens: hero+path+one CTA, «На этой неделе», «Ближайшие дедлайны», «Твой список».
 * Each fact appears once. Everything else (profile strength, popular unis, check-chances form, weekly-goal
 * editor, backpack, AI buddy, opportunities, the big feedback form) moved to its own page or a small link here.
 */
export function DashboardScreen({ data }: { data: DashboardData }) {
  const single = data.road.length === 1;
  const ctaLabel = data.heroCta.current ? `Сейчас: ${data.heroCta.current} → ${data.heroCta.cta}` : data.heroCta.cta;
  return (
    <div className="flex flex-col gap-4">
      <section aria-labelledby="hero-h" className="relative overflow-hidden rounded-[var(--radius-hero)] ring-1 ring-border">
        <MapScenery fog={single} />
        <div className="relative z-10 px-5 pt-5 lg:max-w-[520px] lg:p-7 lg:pb-0">
          <p className="text-[14px] font-bold text-forest-700 dark:text-forest-300">{longDate(data.today)}</p>
          <Display as="h1" id="hero-h" className="mt-1 text-[26px] font-bold leading-[1.1] sm:text-[30px] lg:text-[34px]">
            Привет, {data.firstName}!
          </Display>
          <p className="mt-2 text-[15px] font-semibold text-ink-2 lg:text-[15.5px]">{data.headline}</p>
        </div>
        <ProgressRoad steps={data.road} finish={data.roadFinish} className="relative px-5 pb-5 pt-4 lg:px-7 lg:pb-7 lg:pt-4" />
        <div className="relative z-10 px-5 pb-5 lg:px-7 lg:pb-7">
          <Button href={data.heroCta.href} size="lg" icon={!data.heroCta.current} className="w-full whitespace-normal text-center sm:w-auto">
            {ctaLabel}
          </Button>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <WeeklyTasksCard tasks={data.weekTasks} streakDays={data.streak?.days ?? null} weeklyGoal={data.progress?.weeklyGoal ?? null} />
        <DeadlinesTickets items={data.deadlines} today={data.today} />
      </div>

      <ShortlistSummaryCard data={data.chances} />

      <div className="flex justify-center">
        <FeedbackDisclosure page="dashboard" />
      </div>
    </div>
  );
}
