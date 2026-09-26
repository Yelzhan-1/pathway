import { Check } from 'lucide-react';
import type { StreakData } from '@/types/pathway';
import { plural } from '@/lib/format';
import { cn } from '@/lib/utils';
import { Flame } from '../primitives/Flame';
import { Num } from '../primitives/Num';
import { Button, Display, Skeleton, TCard, WidgetSkeleton } from '../ui/tropa';

/** Streak + weekly quest (block 4 · LATER → null renders the friendly empty state). */
export function StreakCard({ data, loading }: { data: StreakData | null; loading?: boolean }) {
  if (loading) return <WidgetSkeleton rows={0}><Skeleton className="h-8 w-40" /><div className="flex justify-between">{Array.from({ length: 7 }).map((_, i) => <Skeleton key={i} className="size-9 rounded-full" />)}</div></WidgetSkeleton>;
  if (!data) return (
    <TCard surface="honey" labelledBy="st-h">
      <div className="flex items-center gap-2.5"><span className="opacity-60 grayscale-[.4]"><Flame size={30} /></span><Display id="st-h" className="text-[16px]">Серия дней</Display></div>
      <p className="mt-2 text-[14px] font-semibold leading-snug text-ink-2">Огонёк зажжётся после первого шага. Заходи каждый день — он будет расти.</p>
      <Button href="/profile" size="sm" variant="soft" className="mt-3" icon>Сделать первый шаг</Button>
    </TCard>
  );
  return (
    <TCard surface="honey" labelledBy="st-h">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <Flame size={30} />
        <span className="font-display text-[26px] font-semibold leading-none"><Num to={data.days} from={Math.max(0, data.days - 1)} delay={0.8} duration={0.6} /></span>
        <h2 id="st-h" className="text-[14px] font-bold text-honey-deep">{plural(data.days, 'день', 'дня', 'дней')} подряд</h2>
        {data.quest && <span className="ml-auto text-[12.5px] font-bold text-honey-deep">{data.quest.title} {data.quest.done}/{data.quest.total}</span>}
      </div>
      <ol className="mt-3 flex justify-between" aria-label="Неделя">
        {data.week.map((d, i) => (
          <li key={i} className={cn('grid size-9 place-items-center rounded-full', d === 'done' ? 'bg-honey text-honey-ink shadow-[0_3px_0_var(--honey-600)]' : d === 'today' ? 'bg-card ring-2 ring-honey-600' : 'bg-card/70')} aria-label={`${data.weekdayLabels[i]}: ${d === 'done' ? 'сделано' : d === 'today' ? 'сегодня' : 'впереди'}`}>
            {d === 'done' ? <Check className="size-4" strokeWidth={3} aria-hidden /> : <span className="text-[11px] font-bold text-honey-deep" aria-hidden>{data.weekdayLabels[i]}</span>}
          </li>
        ))}
      </ol>
    </TCard>
  );
}
