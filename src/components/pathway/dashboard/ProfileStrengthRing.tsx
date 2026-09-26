import Link from 'next/link';
import { Plus, UserRound } from 'lucide-react';
import type { ProfileStrength } from '@/types/pathway';
import { Ring } from '../primitives/Ring';
import { Button, Display, EmptyCta, Skeleton, TCard, WidgetSkeleton } from '../ui/tropa';

/** Profile strength (block 2 · NOW): ring + missing fields → deep links to /profile#field. */
export function ProfileStrengthRing({ data, loading }: { data: ProfileStrength | null; loading?: boolean }) {
  if (loading) return <WidgetSkeleton><div className="flex items-center gap-4"><Skeleton className="size-[104px] rounded-full" /><Skeleton className="h-10 flex-1" /></div><Skeleton className="h-10" /><Skeleton className="h-10" /></WidgetSkeleton>;
  if (!data) return (
    <TCard labelledBy="ps-h">
      <Display id="ps-h" className="text-[16px]">Сила профиля</Display>
      <EmptyCta art={<span className="grid size-11 place-items-center rounded-[14px] bg-tone-mint-bg text-tone-mint-fg" aria-hidden><UserRound className="size-6" /></span>}
        title="Профиль пока пустой" text="10 коротких вопросов — и мы покажем, чего не хватает до поступления." cta="Заполнить за 3 минуты" href="/onboarding" variant="primary" />
    </TCard>
  );
  return (
    <TCard labelledBy="ps-h">
      <div className="flex items-center gap-4">
        <Ring value={data.percent} size={104} stroke={12} delay={0.2} />
        <div className="min-w-0"><Display id="ps-h" className="text-[16px]">Сила профиля</Display><p className="mt-1 text-[13px] font-semibold text-muted-foreground">{data.levelLabel}</p></div>
      </div>
      {data.missing.length > 0 ? (
        <ul className="mt-3 space-y-1.5" aria-label="Чего не хватает">
          {data.missing.map((m) => (
            <li key={m.id}><Link href={m.href} className="flex min-h-11 items-center gap-2.5 rounded-[14px] bg-background px-3 text-[14px] font-bold ring-1 ring-border hover:ring-input">
              <span className="grid size-6 place-items-center rounded-full bg-tone-honey-bg text-tone-honey-fg" aria-hidden><Plus className="size-3.5" strokeWidth={3} /></span>{m.label}
              <span className="ml-auto text-[12px] font-extrabold text-success">+{m.gain}%</span>
            </Link></li>
          ))}
        </ul>
      ) : <p className="mt-3 rounded-[14px] bg-success-soft px-3 py-2.5 text-[14px] font-bold text-success">Все поля заполнены. Так держать!</p>}
      <Button href="/profile" className="mt-3 w-full">Улучшить профиль</Button>
    </TCard>
  );
}
