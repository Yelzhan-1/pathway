import type { ReactNode } from 'react';
import { RotateCcw } from 'lucide-react';

/** Loading skeleton block (no shimmer — calm pulse, disabled by reduced-motion CSS). */
export function Skeleton({ className = '' }: { className?: string }) {
  return <div aria-hidden className={`animate-pulse rounded-xl bg-secondary ${className}`} />;
}

/** Empty state: one sentence + one action. Optional handwritten hint. */
export function EmptyState({ title, action, onAction, children }: { title: string; action?: string; onAction?: () => void; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-start gap-3 py-2">
      <p className="text-[15px] font-semibold text-ink-2">{title}</p>
      {children}
      {action && <button type="button" onClick={onAction} className="inline-flex h-11 items-center rounded-full bg-secondary px-4 text-[14px] font-bold text-secondary-foreground">{action}</button>}
    </div>
  );
}

/** Inline error: human sentence + retry. Never red walls of text. */
export function ErrorState({ title = 'Не получилось загрузить.', onRetry }: { title?: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex items-center gap-3 rounded-2xl bg-danger-soft px-4 py-3 text-[14px] font-semibold text-destructive">
      <span className="flex-1">{title}</span>
      {onRetry && <button type="button" onClick={onRetry} className="inline-flex h-11 items-center gap-1.5 rounded-full px-3 font-bold hover:bg-white/60"><RotateCcw className="size-4" aria-hidden />Ещё раз</button>}
    </div>
  );
}
