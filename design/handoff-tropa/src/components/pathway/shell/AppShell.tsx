'use client';
import Link from 'next/link';
import { useEffect, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Bell, LogOut, MoreHorizontal, Search, X } from 'lucide-react';
import type { ShellData } from '@/types/pathway';
import { cn } from '@/lib/utils';
import { initials } from '@/lib/format';
import { Flame } from '../primitives/Flame';
import { Signpost } from '../ui/illustrations';
import { Button, ExampleChip, IconTile, Logo } from '../ui/tropa';
import { ThemeToggle } from './ThemeToggle';
import { MOBILE_TABS, NAV_ICON } from './nav';

/**
 * App shell «Тропа».
 * ≥lg: sidebar 252px (colourful icon tiles, guide card, user block) + topbar 72px (search, streak, notifications, theme, avatar).
 * <lg: compact topbar + bottom bar (5 tabs + «Ещё» → bottom sheet with the rest of the IA). Content gets pb-28 for the bar.
 */
export function AppShell({ data, active, children, isExample, initialMoreOpen = false }: { data: ShellData; active: string; children: ReactNode; isExample?: boolean; initialMoreOpen?: boolean }) {
  const [more, setMore] = useState(initialMoreOpen);
  return (
    <div className="min-h-dvh bg-background text-foreground lg:flex">
      <Sidebar data={data} active={active} />
      <div className="min-w-0 flex-1">
        <TopBar data={data} isExample={isExample} />
        <main id="main" className="px-4 pb-28 pt-2 sm:px-6 lg:pb-12 lg:pl-0 lg:pr-6">{children}</main>
      </div>
      <MobileNav data={data} active={active} onMore={() => setMore(true)} moreOpen={more} />
      <MoreSheet data={data} active={active} open={more} onClose={() => setMore(false)} />
    </div>
  );
}

function Sidebar({ data, active }: { data: ShellData; active: string }) {
  return (
    <aside data-shell className="sticky top-0 hidden h-dvh w-[252px] shrink-0 flex-col px-4 py-5 lg:flex" aria-label="Основная навигация">
      <Link href="/dashboard" className="rounded-[14px] px-2" aria-label="pathway — на главную"><Logo /></Link>
      <nav className="mt-6 min-h-0 flex-1 space-y-1 overflow-y-auto pb-3">
        {data.nav.map((n) => {
          const on = n.id === active;
          return (
            <Link key={n.id} href={n.href} aria-current={on ? 'page' : undefined}
              className={cn('flex h-11 items-center gap-3 rounded-[16px] px-2 text-[14.5px] font-bold transition-colors', on ? 'bg-card shadow-chunky-soft ring-1 ring-border' : 'text-ink-2 hover:bg-card/60')}>
              <IconTile icon={NAV_ICON[n.icon]} tone={n.tone} />
              <span className="truncate">{n.label}</span>
              {!!n.badge && <span className="ml-auto rounded-full bg-tone-coral-bg px-2 text-[12px] text-tone-coral-fg" aria-label={`${n.badge} новых`}>{n.badge}</span>}
              {n.soon && <span className="ml-auto rounded-full bg-secondary px-2 text-[11px] font-bold text-muted-foreground">скоро</span>}
            </Link>
          );
        })}
      </nav>
      {data.guide && (
        <div className="relative overflow-hidden rounded-[22px] bg-honey-soft p-4 ring-1 ring-[color-mix(in_oklab,var(--honey-600)_28%,transparent)]">
          <Signpost className="absolute -right-1 top-1 w-[74px]" />
          <p className="max-w-[120px] font-display text-[14px] font-semibold leading-snug">{data.guide.title}</p>
          <p className="mt-1 max-w-[130px] text-[12.5px] font-medium text-ink-2">{data.guide.text}</p>
          <Button href={data.guide.href} size="sm" className="mt-3">{data.guide.cta}</Button>
        </div>
      )}
      <div className="mt-3 flex items-center gap-2.5 px-1">
        <Avatar name={data.user.name} />
        <span className="min-w-0 flex-1"><span className="block truncate text-[14px] font-bold">{data.user.name}</span>{data.user.city && <span className="block text-[12.5px] text-muted-foreground">{data.user.city}</span>}</span>
        <button type="button" aria-label="Выйти" className="grid size-10 place-items-center rounded-full text-muted-foreground hover:bg-card"><LogOut className="size-[18px]" aria-hidden /></button>
      </div>
    </aside>
  );
}

export function Avatar({ name, size = 40, className }: { name: string; size?: number; className?: string }) {
  return <span aria-hidden className={cn('grid shrink-0 place-items-center rounded-full bg-tone-mint-bg font-extrabold text-tone-mint-fg ring-2 ring-card', className)} style={{ width: size, height: size, fontSize: size * 0.35 }}>{initials(name)}</span>;
}

function StreakChip({ days }: { days: number }) {
  return <span className="inline-flex h-10 items-center gap-1.5 rounded-full bg-honey-soft px-3 text-[15px] font-extrabold text-honey-deep" aria-label={`Серия: ${days} дней подряд`}><Flame size={20} />{days}</span>;
}

function TopBar({ data, isExample }: { data: ShellData; isExample?: boolean }) {
  return (
    <header data-shell className="sticky top-0 z-30 flex h-16 items-center gap-2 bg-background/90 px-4 backdrop-blur-md sm:px-6 lg:static lg:h-[72px] lg:gap-3 lg:bg-transparent lg:pl-0 lg:pr-6 lg:backdrop-blur-none">
      <Link href="/dashboard" className="lg:hidden" aria-label="pathway — на главную"><Logo /></Link>
      <form role="search" className="relative hidden lg:block" action="/universities">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-muted-foreground" aria-hidden />
        <input name="q" type="search" placeholder="Найти вуз или программу" aria-label="Поиск вузов и программ"
          className="h-12 w-[min(420px,32vw)] rounded-full bg-card pl-11 pr-4 text-[14.5px] shadow-chunky-soft ring-1 ring-border placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
      </form>
      <div className="ml-auto flex items-center gap-2">
        {data.streakDays != null && data.streakDays > 0 && <StreakChip days={data.streakDays} />}
        {isExample && <ExampleChip className="hidden sm:inline-flex" />}
        <ThemeToggle className="hidden lg:inline-flex" />
        <button type="button" aria-label={data.notifications ? `Уведомления: ${data.notifications} новых` : 'Уведомления'} className="relative grid size-10 place-items-center rounded-full bg-card ring-1 ring-border">
          <Bell className="size-[18px]" aria-hidden />
          {!!data.notifications && <span aria-hidden className="absolute -right-0.5 -top-0.5 grid size-[18px] place-items-center rounded-full bg-destructive text-[10.5px] font-bold text-white dark:text-[#2A0B08]">{data.notifications}</span>}
        </button>
        <Link href="/profile" aria-label="Профиль" className="hidden lg:block"><Avatar name={data.user.name} className="bg-primary text-primary-foreground ring-0" /></Link>
      </div>
    </header>
  );
}

function MobileNav({ data, active, onMore, moreOpen }: { data: ShellData; active: string; onMore: () => void; moreOpen: boolean }) {
  const inTabs = MOBILE_TABS.some((t) => t.id === active);
  return (
    <nav data-shell aria-label="Основная навигация" className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 pb-[max(env(safe-area-inset-bottom),6px)] backdrop-blur-md lg:hidden">
      <ul className="mx-auto grid max-w-[560px] grid-cols-6 px-1 pt-1.5">
        {MOBILE_TABS.map((t) => {
          const n = data.nav.find((x) => x.id === t.id); if (!n) return null;
          const I = NAV_ICON[n.icon]; const on = t.id === active;
          return (
            <li key={t.id}>
              <Link href={n.href} aria-current={on ? 'page' : undefined} className="flex min-h-[54px] flex-col items-center justify-center gap-1 rounded-[14px] text-[11px] font-bold">
                <span className={cn('grid h-8 w-12 place-items-center rounded-full transition-colors', on ? 'bg-primary text-primary-foreground shadow-chunky' : 'text-ink-2')}><I className="size-[19px]" strokeWidth={2.4} aria-hidden /></span>
                <span className={on ? 'text-foreground' : 'text-muted-foreground'}>{t.label}</span>
              </Link>
            </li>
          );
        })}
        <li>
          <button type="button" onClick={onMore} aria-haspopup="dialog" aria-expanded={moreOpen} className="flex min-h-[54px] w-full flex-col items-center justify-center gap-1 rounded-[14px] text-[11px] font-bold">
            <span className={cn('grid h-8 w-12 place-items-center rounded-full', moreOpen || !inTabs ? 'bg-secondary text-secondary-foreground' : 'text-ink-2')}><MoreHorizontal className="size-[19px]" aria-hidden /></span>
            <span className="text-muted-foreground">Ещё</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}

function MoreSheet({ data, active, open, onClose }: { data: ShellData; active: string; open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k);
  }, [open, onClose]);
  const rest = data.nav.filter((n) => !MOBILE_TABS.some((t) => t.id === n.id));
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <motion.div className="absolute inset-0 bg-forest-950/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} aria-hidden />
          <motion.div role="dialog" aria-modal="true" aria-labelledby="more-title" className="absolute inset-x-0 bottom-0 rounded-t-[28px] bg-background px-4 pb-[max(env(safe-area-inset-bottom),16px)] pt-2 shadow-lift"
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', stiffness: 380, damping: 36 }}>
            <div className="mx-auto mb-2 h-1.5 w-10 rounded-full bg-input" aria-hidden />
            <div className="flex items-center"><h2 id="more-title" className="font-display text-[18px] font-semibold">Ещё</h2>
              <button type="button" onClick={onClose} aria-label="Закрыть" className="ml-auto grid size-11 place-items-center rounded-full bg-card ring-1 ring-border"><X className="size-5" aria-hidden /></button></div>
            <ul className="mt-3 grid grid-cols-2 gap-2">
              {rest.map((n) => (
                <li key={n.id}><Link href={n.href} aria-current={n.id === active ? 'page' : undefined} className="flex min-h-14 items-center gap-2.5 rounded-[18px] bg-card px-3 text-[14px] font-bold leading-tight shadow-chunky-soft ring-1 ring-border">
                  <IconTile icon={NAV_ICON[n.icon]} tone={n.tone} /><span className="min-w-0">{n.label}</span>
                  {!!n.badge && <span className="ml-auto rounded-full bg-tone-coral-bg px-2 text-[12px] text-tone-coral-fg">{n.badge}</span>}
                </Link></li>
              ))}
            </ul>
            {data.guide && (
              <div className="mt-3 flex items-center gap-3 rounded-[20px] bg-honey-soft p-3.5">
                <Signpost className="w-14 shrink-0" />
                <div className="min-w-0 flex-1"><p className="font-display text-[14px] font-semibold">{data.guide.title}</p><p className="text-[12.5px] font-medium text-ink-2">{data.guide.text}</p></div>
                <Button href={data.guide.href} size="sm">{data.guide.cta}</Button>
              </div>
            )}
            <div className="mt-3 flex items-center gap-2.5 rounded-[20px] bg-card p-3 ring-1 ring-border">
              <Avatar name={data.user.name} />
              <span className="min-w-0 flex-1"><span className="block truncate text-[14px] font-bold">{data.user.name}</span>{data.user.city && <span className="block text-[12.5px] text-muted-foreground">{data.user.city}</span>}</span>
              <ThemeToggle />
              <button type="button" aria-label="Выйти" className="grid size-10 place-items-center rounded-full text-muted-foreground ring-1 ring-border"><LogOut className="size-[18px]" aria-hidden /></button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
