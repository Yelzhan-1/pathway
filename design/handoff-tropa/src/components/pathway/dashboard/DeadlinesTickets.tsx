import Link from 'next/link';
import { CalendarClock } from 'lucide-react';
import type { DeadlineTicket } from '@/types/pathway';
import { dayMonth, daysBetween, plural } from '@/lib/format';
import { cn } from '@/lib/utils';
import { EmptyCta, Skeleton, TCard, WidgetHeader, WidgetSkeleton } from '../ui/tropa';

/** Deadlines as tear-off tickets (block 4 · LATER). ≤ 7 days → «hot» (destructive stub). Days are counted from server `today`. */
export function DeadlinesTickets({ items, today, loading }: { items: DeadlineTicket[] | null; today: string; loading?: boolean }) {
  if (loading) return <WidgetSkeleton />;
  return (
    <TCard labelledBy="dl-h">
      <WidgetHeader id="dl-h" title="Дедлайны" />
      {!items?.length ? (
        <EmptyCta art={<span className="grid size-11 place-items-center rounded-[14px] bg-tone-coral-bg text-tone-coral-fg" aria-hidden><CalendarClock className="size-6" /></span>} title="Дедлайнов пока нет" text="Выбери вузы — и мы сами соберём все сроки подачи." cta="Выбрать вузы" href="/universities" />
      ) : (
        <ul className="mt-3 space-y-2">
          {items.slice(0, 3).map((d) => {
            const n = daysBetween(today, d.date); const hot = n <= 7;
            const body = (
              <>
                <span className={cn('self-stretch grid place-items-center w-[62px] shrink-0 border-r-2 border-dashed border-card py-2.5 text-center text-[12px] font-extrabold', hot ? 'bg-destructive text-white dark:text-[#2A0B08]' : 'bg-primary text-primary-foreground')}>{dayMonth(d.date)}</span>
                <span className="min-w-0 flex-1 px-2.5 py-1.5 text-[13px] font-bold leading-tight">{d.title}</span>
                <span className={cn('shrink-0 pr-2.5 text-[11.5px] font-bold', hot ? 'text-destructive' : 'text-muted-foreground')}>{n <= 0 ? 'сегодня' : `${n} ${plural(n, 'день', 'дня', 'дней')}`}</span>
              </>
            );
            return <li key={d.id}>{d.href ? <Link href={d.href} className="flex items-center overflow-hidden rounded-[14px] ring-1 ring-border">{body}</Link> : <div className="flex items-center overflow-hidden rounded-[14px] ring-1 ring-border">{body}</div>}</li>;
          })}
        </ul>
      )}
    </TCard>
  );
}
