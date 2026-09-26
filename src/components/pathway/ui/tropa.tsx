/**
 * Tropa primitives: chunky cards/buttons, colourful icon tiles, widget frame with explicit empty + loading states.
 * Server-safe (no hooks) → import from Server or Client components.
 */
import Link from 'next/link';
import type { ComponentType, ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import type { Tone } from '@/types/pathway';
import { cn } from '@/lib/utils';

export const TONE: Record<Tone, string> = {
  forest: 'bg-primary text-primary-foreground',
  mint: 'bg-tone-mint-bg text-tone-mint-fg',
  honey: 'bg-tone-honey-bg text-tone-honey-fg',
  coral: 'bg-tone-coral-bg text-tone-coral-fg',
  dream: 'bg-tone-dream-bg text-tone-dream-fg',
  sky: 'bg-tone-sky-bg text-tone-sky-fg',
};

/** Display heading (Unbounded). Use for H1–H3 and big numbers only; body/UI stays Onest. */
export function Display({ as: Tag = 'h2', className, children, id }: { as?: 'h1' | 'h2' | 'h3' | 'p' | 'span'; className?: string; children: ReactNode; id?: string }) {
  return <Tag id={id} className={cn('font-display font-semibold tracking-[-0.02em] text-balance', className)}>{children}</Tag>;
}

/**
 * Page header for inner pages: title + one-line subtitle + optional decorative
 * illustration scene (top-right) + optional single primary action. Same card
 * language as the dashboard hero, so every page opens with the same rhythm.
 */
export function PageHeader({
  title,
  subtitle,
  illustration,
  action,
  className,
}: {
  title: string;
  subtitle?: string;
  illustration?: ReactNode;
  action?: { label: string; href: string };
  className?: string;
}) {
  return (
    <header className={cn('relative overflow-hidden rounded-[var(--radius-hero)] bg-card p-5 ring-1 ring-border sm:p-6', className)}>
      {illustration && (
        <div aria-hidden className="pointer-events-none absolute -right-3 -top-3 w-[104px] opacity-90 sm:w-[136px]">
          {illustration}
        </div>
      )}
      <div className="relative z-10 max-w-[calc(100%-84px)] sm:max-w-[440px]">
        <Display as="h1" className="text-[24px] font-bold leading-tight sm:text-[28px]">{title}</Display>
        {subtitle && <p className="mt-1.5 text-[14px] font-medium leading-snug text-ink-2">{subtitle}</p>}
        {action && <Button href={action.href} size="md" className="mt-4" icon>{action.label}</Button>}
      </div>
    </header>
  );
}

/** Small pill stat: optional icon tile + label + value. For key facts rows (Вузы cards, exams, etc). */
export function StatChip({ icon: I, label, value, tone = 'mint', className }: { icon?: ComponentType<{ className?: string; strokeWidth?: number }>; label?: string; value: string; tone?: Tone; className?: string }) {
  return (
    <span className={cn('inline-flex min-h-9 items-center gap-2 rounded-full bg-card px-3 text-[13px] font-bold ring-1 ring-border', className)}>
      {I && <IconTile icon={I} tone={tone} size={24} />}
      {label && <span className="text-muted-foreground">{label}</span>}
      <span>{value}</span>
    </span>
  );
}

/** White card with the 2px «chunky» bottom edge. `tone` swaps the surface. */
export function TCard({ children, className, surface = 'card', as: Tag = 'section', labelledBy }: { children: ReactNode; className?: string; surface?: 'card' | 'honey' | 'forest' | 'mint'; as?: 'section' | 'div' | 'article'; labelledBy?: string }) {
  const s = {
    card: 'bg-card text-card-foreground ring-1 ring-border shadow-card',
    honey: 'bg-honey-soft text-foreground ring-1 ring-[color-mix(in_oklab,var(--honey-600)_28%,transparent)] shadow-card',
    forest: 'bg-forest-700 text-white ring-1 ring-forest-800 shadow-card dark:bg-forest-900 dark:ring-forest-800',
    mint: 'bg-secondary text-foreground ring-1 ring-border shadow-card',
  }[surface];
  return <Tag aria-labelledby={labelledBy} className={cn('relative rounded-[var(--radius-card)] p-5', s, className)}>{children}</Tag>;
}

type BtnVariant = 'primary' | 'honey' | 'soft' | 'ghost' | 'inverse';
const BTN: Record<BtnVariant, string> = {
  primary: 'bg-primary text-primary-foreground shadow-chunky press',
  honey: 'bg-honey text-honey-ink shadow-chunky-honey press',
  soft: 'bg-card text-foreground ring-1 ring-input shadow-chunky-soft press',
  ghost: 'text-primary hover:bg-secondary',
  inverse: 'bg-white text-forest-800 shadow-[0_4px_0_rgb(0_0_0/.25)] press',
};
const SIZE = { sm: 'h-10 px-4 text-[13.5px]', md: 'h-11 px-5 text-[14.5px]', lg: 'h-14 px-7 text-[16px]' };
/** Chunky button (3D edge, presses down 3px). Renders <Link> when href is given. Min touch target 40–56px. */
export function Button({ children, href, variant = 'primary', size = 'md', className, type = 'button', disabled, onClick, icon = false, ...aria }: { children: ReactNode; href?: string; variant?: BtnVariant; size?: keyof typeof SIZE; className?: string; type?: 'button' | 'submit'; disabled?: boolean; onClick?: () => void; icon?: boolean; 'aria-label'?: string }) {
  const cls = cn('inline-flex select-none items-center justify-center gap-2 rounded-full font-bold whitespace-nowrap disabled:pointer-events-none disabled:opacity-45', BTN[variant], SIZE[size], className);
  const inner = <>{children}{icon && <ArrowRight className="size-4" aria-hidden />}</>;
  if (href) return <Link href={href} className={cls} {...aria}>{inner}</Link>;
  return <button type={type} className={cls} disabled={disabled} onClick={onClick} {...aria}>{inner}</button>;
}

/** Colourful rounded icon tile (sidebar, lists). Decorative. */
export function IconTile({ icon: I, tone = 'mint', size = 32, className }: { icon: ComponentType<{ className?: string; strokeWidth?: number }>; tone?: Tone; size?: number; className?: string }) {
  return (
    <span aria-hidden className={cn('grid shrink-0 place-items-center rounded-[11px]', TONE[tone], className)} style={{ width: size, height: size }}>
      <I className={size >= 36 ? 'size-[19px]' : 'size-[17px]'} strokeWidth={2.4} />
    </span>
  );
}

/** Widget header: title (Unbounded 16–17) + optional right link/meta. */
export function WidgetHeader({ id, title, icon, tone, right, className }: { id?: string; title: string; icon?: ComponentType<{ className?: string; strokeWidth?: number }>; tone?: Tone; right?: ReactNode; className?: string }) {
  return (
    <div className={cn('flex min-h-8 items-center gap-2.5', className)}>
      {icon && <IconTile icon={icon} tone={tone} size={30} />}
      <Display id={id} as="h2" className="text-[16px] leading-tight">{title}</Display>
      {right && <div className="ml-auto shrink-0 text-[13px] font-bold">{right}</div>}
    </div>
  );
}
export function HeaderLink({ href, children }: { href: string; children: ReactNode }) {
  return <Link href={href} className="inline-flex min-h-10 items-center rounded-full px-2 text-primary hover:bg-secondary">{children}</Link>;
}

/** Calm pulse skeleton block (pulse is disabled by reduced-motion CSS). */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn('animate-pulse rounded-[14px] bg-secondary', className)} />;
}
/** Generic widget skeleton: header + N rows. Each widget passes its own geometry via `rows`/`children`. */
export function WidgetSkeleton({ className, rows = 3, children, label = 'Загружаем…' }: { className?: string; rows?: number; children?: ReactNode; label?: string }) {
  return (
    <TCard className={className}>
      <span className="sr-only" role="status">{label}</span>
      <div className="flex items-center gap-2.5"><Skeleton className="size-[30px] rounded-[11px]" /><Skeleton className="h-4 w-32" /></div>
      <div className="mt-4 space-y-2.5">{children ?? Array.from({ length: rows }).map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
    </TCard>
  );
}

/** Friendly empty state: dashed illustration box + one sentence + one CTA. Never fake numbers. */
export function EmptyCta({ art, title, text, cta, href, variant = 'soft', className }: { art?: ReactNode; title: string; text?: string; cta: string; href: string; variant?: BtnVariant; className?: string }) {
  return (
    <div className={cn('mt-3 flex flex-col items-start gap-3 rounded-[20px] border-2 border-dashed border-input p-4', className)}>
      {art}
      <div>
        <p className="text-[15px] font-bold leading-snug">{title}</p>
        {text && <p className="mt-1 text-[13.5px] font-medium leading-snug text-muted-foreground">{text}</p>}
      </div>
      <Button href={href} variant={variant} size="sm" icon>{cta}</Button>
    </div>
  );
}

/** «пример данных» chip — render only when data.isExample (fixtures / /dev/states). */
export function ExampleChip({ className }: { className?: string }) {
  return <span className={cn('inline-flex h-8 items-center rounded-full bg-tone-dream-bg px-3 text-[12px] font-bold text-tone-dream-fg', className)}>пример данных</span>;
}

/** Tropa logo: forest tile with a route glyph + wordmark in Unbounded. */
export function Logo({ className, inverse = false }: { className?: string; inverse?: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <span aria-hidden className={cn('grid size-10 place-items-center rounded-[14px]', inverse ? 'bg-white text-forest-800' : 'bg-primary text-primary-foreground shadow-chunky')}>
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="19" r="2.5" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="2.5" /></svg>
      </span>
      <span className={cn('font-display text-[19px] font-bold tracking-[-0.03em]', inverse && 'text-white')}>pathway</span>
    </span>
  );
}
