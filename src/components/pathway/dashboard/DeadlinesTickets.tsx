import Link from 'next/link';
import { CalendarClock } from 'lucide-react';
import type { DeadlineTicket } from '@/types/pathway';
import { dayMonth, daysBetween, plural } from '@/lib/format';
import { cn } from '@/lib/utils';
import { EmptyCta, TCard, WidgetHeader, WidgetSkeleton } from '../ui/tropa';

/** Deadlines as tear-off tickets. Days are counted from server `today`. */
export function DeadlinesTickets({ items, today, loading }: { items: DeadlineTicket[] | null; today: string; loading?: boolean }) {
  if (loading) return <WidgetSkeleton />;
  return (
    <TCard labelledBy="dl-h" className="min-w-0">
      <WidgetHeader id="dl-h" title="Дедлайны" />
      {!items?.length ? (
        <EmptyCta art={<span className="grid size-11 place-items-center rounded-[14px] bg-tone-coral-bg text-tone-coral-fg" aria-hidden><CalendarClock className="size-6" /></span>} title="Дедлайнов пока нет" text="Выбери вузы — и мы сами соберём все сроки подачи." cta="Выбрать вузы" href="/universities" />
      ) : (
        <ul className="mt-3 space-y-2">
          {items.slice(0, 3).map((d) => {
            const n = daysBetween(today, d.date); const hot = n <= 7;
            const body = (
              <>
                <span className={cn('grid w-full place-items-center py-2 text-center text-[12px] font-extrabold sm:w-[62px] sm:shrink-0 sm:self-stretch sm:border-r-2 sm:border-dashed sm:border-card sm:py-2.5', hot ? 'bg-destructive text-white dark:text-[#2A0B08]' : 'bg-primary text-primary-foreground')}>{dayMonth(d.date)}</span>
                <span className="min-w-0 flex-1 px-2.5 py-1.5">
                  <span className="block text-[13px] font-bold leading-tight [overflow-wrap:anywhere]">{d.title}</span>
                  <span className={cn('mt-0.5 block text-[11.5px] font-bold', hot ? 'text-destructive' : 'text-muted-foreground')}>{n <= 0 ? 'сегодня' : `${n} ${plural(n, 'день', 'дня', 'дней')}`}</span>
                </span>
              </>
            );
            return <li key={d.id} className="min-w-0">{d.href ? <Link href={d.href} className="flex min-w-0 flex-col overflow-hidden rounded-[14px] ring-1 ring-border sm:flex-row sm:items-stretch">{body}</Link> : <div className="flex min-w-0 flex-col overflow-hidden rounded-[14px] ring-1 ring-border sm:flex-row sm:items-stretch">{body}</div>}</li>;
          })}
        </ul>
      )}
    </TCard>
  );
}
