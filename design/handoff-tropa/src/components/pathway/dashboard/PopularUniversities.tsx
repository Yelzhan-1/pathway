'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Building2, Heart } from 'lucide-react';
import type { UniCard } from '@/types/pathway';
import { cn } from '@/lib/utils';
import { Flag } from '../ui/Flag';
import { UniMonogram } from '../ui/UniMonogram';
import { EmptyCta, HeaderLink, Skeleton, TCard, WidgetHeader, WidgetSkeleton } from '../ui/tropa';

const CARD = ['bg-tone-mint-bg/60 ring-[color-mix(in_oklab,var(--tone-mint-fg)_18%,transparent)]', 'bg-tone-honey-bg ring-[color-mix(in_oklab,var(--tone-honey-fg)_18%,transparent)]', 'bg-tone-dream-bg ring-[color-mix(in_oklab,var(--tone-dream-fg)_18%,transparent)]', 'bg-tone-sky-bg ring-[color-mix(in_oklab,var(--tone-sky-fg)_18%,transparent)]'];
const TILT = ['lg:-rotate-[1.5deg]', 'lg:rotate-1', 'lg:-rotate-1'];

/**
 * «Collectible» university cards. Monogram + flag (NO logos). Block 3 catalog — the list itself can already come from the
 * `universities` table (35 rows, sorted by popularity/manual rank). Mobile: horizontal snap scroll, no tilt.
 * `onToggleSave` → server action; optimistic local state here.
 */
export function PopularUniversities({ unis, total, loading, onToggleSave }: { unis: UniCard[] | null; total?: number; loading?: boolean; onToggleSave?: (id: string, saved: boolean) => void }) {
  const [saved, setSaved] = useState<Record<string, boolean>>(() => Object.fromEntries((unis ?? []).map((u) => [u.id, !!u.saved])));
  if (loading) return <WidgetSkeleton><div className="flex gap-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-[132px] flex-1 rounded-[20px]" />)}</div></WidgetSkeleton>;
  return (
    <TCard labelledBy="pu-h" className="min-w-0">
      <WidgetHeader id="pu-h" title="Популярные вузы" right={unis?.length ? <HeaderLink href="/universities">Все {total ?? ''}</HeaderLink> : undefined} />
      {!unis?.length ? (
        <EmptyCta art={<span className="grid size-11 place-items-center rounded-[14px] bg-tone-honey-bg text-tone-honey-fg" aria-hidden><Building2 className="size-6" /></span>} title="Каталог скоро наполнится" text="Загляни в поиск — там уже есть вузы Казахстана и мира." cta="Открыть каталог" href="/universities" />
      ) : (
        <ul className="-mx-5 mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 pt-1 [scrollbar-width:none] lg:mx-0 lg:overflow-visible lg:px-0 lg:pb-0">
          {unis.slice(0, 3).map((u, i) => {
            const on = saved[u.id];
            return (
              <li key={u.id} className={cn('relative w-[68%] shrink-0 snap-start rounded-[20px] p-3 ring-1 sm:w-[44%] lg:w-1/3 lg:shrink', CARD[i % CARD.length], TILT[i % TILT.length])}>
                <div className="flex items-start justify-between">
                  <UniMonogram id={u.id} text={u.monogram} size={40} className="ring-2 ring-card" />
                  <button type="button" aria-pressed={on} aria-label={on ? `Убрать ${u.name} из избранного` : `Добавить ${u.name} в избранное`}
                    onClick={() => { setSaved((s) => ({ ...s, [u.id]: !on })); onToggleSave?.(u.id, !on); }} className="relative z-10 -m-1.5 grid size-10 place-items-center rounded-full hover:bg-card/60">
                    <Heart className={cn('size-5 transition-transform active:scale-125', on ? 'fill-honey text-honey-600' : 'text-muted-foreground')} aria-hidden />
                  </button>
                </div>
                <Link href={u.href} className="mt-2 block text-[14px] font-bold leading-tight after:absolute after:inset-0 after:rounded-[20px] after:content-['']">{u.name}</Link>
                <p className="mt-1 flex items-center gap-1.5 text-[12px] font-semibold text-muted-foreground"><Flag code={u.country} />{u.city}</p>
                <p className="mt-2 flex flex-wrap gap-1">{u.tags.slice(0, 2).map((t) => <span key={t} className="rounded-full bg-card/80 px-2 py-0.5 text-[11px] font-bold text-ink-2">{t}</span>)}</p>
              </li>
            );
          })}
        </ul>
      )}
    </TCard>
  );
}
