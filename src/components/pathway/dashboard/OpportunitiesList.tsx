import Link from 'next/link';
import { Award, Lightbulb, Medal, Rocket, Trophy } from 'lucide-react';
import type { Opportunity, OpportunityKind } from '@/types/pathway';
import { EmptyCta, TCard, WidgetHeader, WidgetSkeleton, IconTile, HeaderLink } from '../ui/tropa';

const KIND: Record<OpportunityKind, { label: string; icon: typeof Award; tone: 'honey' | 'dream' | 'mint' | 'sky' }> = {
  grant: { label: 'Грант', icon: Award, tone: 'honey' }, olympiad: { label: 'Олимпиада', icon: Medal, tone: 'dream' },
  contest: { label: 'Конкурс', icon: Lightbulb, tone: 'mint' }, program: { label: 'Программа', icon: Rocket, tone: 'sky' },
};
/** Grants / olympiads / contests (block 4 · LATER). */
export function OpportunitiesList({ items, loading }: { items: Opportunity[] | null; loading?: boolean }) {
  if (loading) return <WidgetSkeleton />;
  return (
    <TCard labelledBy="op-h">
      <WidgetHeader id="op-h" title="Возможности" right={items?.length ? <HeaderLink href="/opportunities">Все</HeaderLink> : undefined} />
      {!items?.length ? (
        <EmptyCta art={<span className="grid size-11 place-items-center rounded-[14px] bg-tone-honey-bg text-tone-honey-fg" aria-hidden><Trophy className="size-6" /></span>} title="Подберём гранты и олимпиады" text="Как только профиль будет заполнен, здесь появятся подходящие тебе." cta="Дополнить профиль" href="/profile" />
      ) : (
        <ul className="mt-3 space-y-1">
          {items.slice(0, 3).map((o) => { const k = KIND[o.kind]; return (
            <li key={o.id}><Link href={o.href} className="-mx-2 flex min-h-12 items-center gap-2.5 rounded-[14px] px-2 hover:bg-secondary">
              <IconTile icon={k.icon} tone={k.tone} size={36} />
              <span className="min-w-0"><span className="block text-[13.5px] font-bold leading-tight">{o.title}</span><span className="block text-[12px] font-semibold text-muted-foreground">{k.label} · {o.meta}</span></span>
            </Link></li>); })}
        </ul>
      )}
    </TCard>
  );
}
