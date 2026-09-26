'use client';
import { motion } from 'motion/react';
import { Check } from 'lucide-react';
import { usePrefs } from '@/lib/prefs';
import { cn } from '@/lib/utils';

/**
 * Onboarding progress as a mini road: dashed road + small nodes (done ✓ / current honey / ahead).
 * ≥sm shows every short label; on phones only the current label (below). Done nodes are buttons (go back to edit).
 */
export function RoadProgress({ labels, current, onJump, className }: { labels: string[]; current: number /* 0-based */; onJump?: (i: number) => void; className?: string }) {
  const { reduced } = usePrefs();
  const n = labels.length;
  const frac = n > 1 ? current / (n - 1) : 0;
  return (
    <nav aria-label={`Шаг ${current + 1} из ${n}`} className={cn('relative', className)}>
      <div className="relative mx-3 h-10">
        <div className="absolute inset-x-0 top-1/2 h-3 -translate-y-1/2 rounded-full bg-border" aria-hidden>
          <span className="absolute inset-x-2 top-1/2 h-0 -translate-y-1/2 border-t-2 border-dashed border-card" />
          <motion.span className="absolute inset-y-0 left-0 w-full origin-left rounded-full bg-primary" initial={false} animate={{ scaleX: frac }} transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 120, damping: 22 }} />
        </div>
        <ol className="absolute inset-0">
          {labels.map((l, i) => {
            const done = i < current, cur = i === current;
            const x = n > 1 ? (i / (n - 1)) * 100 : 0;
            const dot = (
              <span className={cn('grid place-items-center rounded-full', cur ? 'size-8 bg-honey font-display text-[12px] font-bold text-honey-ink shadow-[0_3px_0_var(--node-current-edge)]' : done ? 'size-6 bg-primary text-primary-foreground shadow-[0_2px_0_var(--chunk-primary)]' : 'size-5 bg-card ring-2 ring-input')}>
                {cur ? i + 1 : done ? <Check className="size-3.5" strokeWidth={3.4} aria-hidden /> : null}
              </span>
            );
            return (
              <li key={l} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${x}%`, top: '50%' }} aria-current={cur ? 'step' : undefined}>
                {done && onJump ? <button type="button" onClick={() => onJump(i)} aria-label={`${l}: изменить`} className="grid size-10 place-items-center rounded-full">{dot}</button> : <span className="grid size-10 place-items-center" aria-label={cur ? `${l}, сейчас` : l}>{dot}</span>}
                <span className={cn('absolute left-1/2 top-[42px] hidden -translate-x-1/2 whitespace-nowrap text-[12px] font-bold sm:block', cur ? 'text-foreground' : done ? 'text-ink-2' : 'text-muted-foreground')} aria-hidden>{l}</span>
              </li>
            );
          })}
        </ol>
      </div>
      <p className="mt-2 text-center text-[13px] font-bold sm:hidden" aria-hidden><span className="text-muted-foreground">Шаг {current + 1} из {n} · </span>{labels[current]}</p>
    </nav>
  );
}
