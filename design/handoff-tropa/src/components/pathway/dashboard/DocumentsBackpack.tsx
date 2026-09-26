import Link from 'next/link';
import { Backpack, Check } from 'lucide-react';
import type { DocItem } from '@/types/pathway';
import { cn } from '@/lib/utils';
import { EmptyCta, Skeleton, TCard, WidgetHeader, WidgetSkeleton } from '../ui/tropa';

/**
 * «Рюкзак документов» (block 2 · NOW): CV status comes from the CV builder; the list of needed docs is derived from the profile
 * (e.g. english cert only if English exam planned; transcript always). null / [] → empty CTA to the CV builder.
 */
export function DocumentsBackpack({ docs, loading }: { docs: DocItem[] | null; loading?: boolean }) {
  if (loading) return <WidgetSkeleton rows={0}><div className="grid grid-cols-3 gap-2">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div></WidgetSkeleton>;
  const done = docs?.filter((d) => d.status === 'done').length ?? 0;
  return (
    <TCard labelledBy="dc-h">
      <WidgetHeader id="dc-h" title="Рюкзак документов" icon={Backpack} tone="sky" right={docs?.length ? <span className="text-muted-foreground" aria-label={`Готово ${done} из ${docs.length}`}>{done}/{docs.length}</span> : undefined} />
      {!docs?.length ? (
        <EmptyCta title="Рюкзак пока пуст" text="Начни с резюме — это 10 минут, а пригодится везде." cta="Собрать резюме" href="/cv" variant="primary" />
      ) : (
        <ul className="mt-3 grid grid-cols-3 gap-2">
          {docs.map((d) => (
            <li key={d.id}>
              <Link href={d.href ?? '/cv'} className={cn('flex min-h-[52px] flex-col items-center justify-center rounded-[14px] px-1.5 py-2 text-center text-[11.5px] font-bold leading-tight', d.status === 'done' ? 'bg-primary text-primary-foreground' : d.status === 'progress' ? 'bg-honey-soft text-honey-deep ring-1 ring-[color-mix(in_oklab,var(--honey-600)_30%,transparent)]' : 'border-2 border-dashed border-input text-muted-foreground')}>
                <span className="flex items-center gap-1">{d.status === 'done' && <Check className="size-3.5 shrink-0" strokeWidth={3} aria-hidden />}{d.title}</span>
                {d.meta && <span className="mt-0.5 text-[10.5px] font-semibold opacity-85">{d.meta}</span>}
                <span className="sr-only">{d.status === 'done' ? ' — готово' : d.status === 'progress' ? ' — в работе' : ' — не начато'}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </TCard>
  );
}
