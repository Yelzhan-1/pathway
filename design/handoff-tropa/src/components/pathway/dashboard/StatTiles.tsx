import Link from 'next/link';
import { Eye, GitCompareArrows, Heart, Search, Sparkles } from 'lucide-react';
import type { StatTile } from '@/types/pathway';
import { cn } from '@/lib/utils';
import { Button, Skeleton } from '../ui/tropa';
import { Num } from '../primitives/Num';

const ICON = { viewed: Eye, favorites: Heart, comparisons: GitCompareArrows, checks: Search } as const;
const TILT = ['lg:-rotate-2', 'lg:rotate-2', 'lg:-rotate-1', 'lg:rotate-1'];

/** «Stickers» over the map (≥lg, slight tilt only on desktop — never on mobile). Block 3 data → null = empty CTA. */
export function StatTiles({ tiles, loading }: { tiles: StatTile[] | null; loading?: boolean }) {
  if (loading) return <div className="grid grid-cols-3 gap-2.5 lg:flex" aria-busy="true">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-[58px] lg:w-[150px]" />)}</div>;
  if (!tiles?.length) return (
    <div className="flex flex-wrap items-center gap-3 rounded-[20px] bg-card/95 p-3 pr-4 shadow-[0_3px_0_var(--map-hill-1)] ring-1 ring-border lg:max-w-[440px]">
      <span className="grid size-10 place-items-center rounded-[13px] bg-tone-honey-bg text-tone-honey-fg" aria-hidden><Sparkles className="size-5" /></span>
      <p className="min-w-0 flex-1 text-[13.5px] font-semibold leading-snug text-ink-2">Смотри вузы и сохраняй любимые — здесь появится твой счёт.</p>
      <Button href="/universities" size="sm" variant="soft">Открыть каталог</Button>
    </div>
  );
  return (
    <ul className="grid grid-cols-3 gap-2.5 lg:flex">
      {tiles.map((t, i) => {
        const I = ICON[t.id];
        return (
          <li key={t.id}>
            <Link href={t.href} className={cn('flex h-full flex-col gap-1 rounded-[18px] bg-card/95 p-2.5 shadow-[0_3px_0_var(--map-hill-1)] ring-1 ring-border lg:flex-row lg:items-center lg:gap-2.5 lg:py-2 lg:pl-2 lg:pr-4', TILT[i])}>
              <span className="grid size-9 place-items-center rounded-[12px] bg-secondary text-secondary-foreground" aria-hidden><I className="size-[18px]" /></span>
              <span className="font-display text-[22px] font-semibold leading-none lg:text-[24px]"><Num to={t.value} delay={0.4 + i * 0.1} duration={1.2} /></span>
              <span className="text-[12px] font-bold leading-tight text-muted-foreground lg:max-w-[92px]">{t.label}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
