import Link from 'next/link';
import { BarChart3 } from 'lucide-react';
import type { ChancesSummary } from '@/types/pathway';
import { strings } from '@/lib/strings';
import { Num } from '../primitives/Num';
import { EmptyCta, Skeleton, TCard, WidgetHeader, WidgetSkeleton, HeaderLink } from '../ui/tropa';

/** Chance baskets from the shortlist: «Мечта», «Цель», «Запасной». Never labels a university «Пока нет». */
export function ChancesColumns({ data, loading }: { data: ChancesSummary | null; loading?: boolean }) {
  if (loading) return <WidgetSkeleton rows={0}><div className="flex items-end gap-2">{[70, 90, 56].map((h, i) => <Skeleton key={i} className="flex-1" />)}</div></WidgetSkeleton>;
  const total = data ? data.safety + data.target + data.dream : 0;
  return (
    <TCard labelledBy="ch-h">
      <WidgetHeader id="ch-h" title="Твои шансы" right={total ? <HeaderLink href={data!.href}>Все</HeaderLink> : undefined} />
      {!data || !total ? (
        <EmptyCta art={<span className="grid size-11 place-items-center rounded-[14px] bg-tone-dream-bg text-tone-dream-fg" aria-hidden><BarChart3 className="size-6" /></span>} title={strings.dashboard.chancesEmpty} text={strings.dashboard.chancesEmptyText} cta={strings.dashboard.chancesCta} href="/universities" />
      ) : (
        <Link href={data.href} className="mt-3 flex items-end gap-2" aria-label={`${strings.fit.category.dream} ${data.dream}, ${strings.fit.category.target} ${data.target}, ${strings.fit.category.safety} ${data.safety}`}>
          {([
            [strings.fit.category.dream, data.dream, "bg-dream text-white dark:text-[#1A0F2E]"],
            [strings.fit.category.target, data.target, "bg-honey text-honey-ink"],
            [strings.fit.category.safety, data.safety, "bg-primary text-primary-foreground"],
          ] as const).map(([l, n, c], i) => (
            <span key={l} className="flex-1 text-center" aria-hidden>
              <span className={`mx-auto grid w-full place-items-center rounded-b-[8px] rounded-t-[16px] font-display text-[22px] font-semibold ${c}`} style={{ height: 34 + (n / Math.max(data.safety, data.target, data.dream)) * 60 }}><Num to={n} delay={0.5 + i * 0.1} duration={0.9} /></span>
              <span className="mt-1.5 block text-[12px] font-bold text-ink-2">{l}</span>
            </span>
          ))}
        </Link>
      )}
    </TCard>
  );
}
