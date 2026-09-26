'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ChevronDown, LogOut } from 'lucide-react';
import type { ShellData } from '@/types/pathway';
import { signOutAction } from '@/lib/actions/sign-out';
import { clearBrowserCvDrafts } from '@/lib/hooks/autosave-patch';
import { strings } from '@/lib/strings';
import { cn } from '@/lib/utils';
import { Avatar } from './Avatar';
import { FreeOnlyToggle } from './FreeOnlyToggle';
import { ThemeToggle } from './ThemeToggle';

function SignOutRow({ userId }: { userId: string }) {
  return (
    <form action={signOutAction} onSubmit={() => clearBrowserCvDrafts(userId)}>
      <button
        type="submit"
        className="flex min-h-11 w-full items-center gap-2.5 rounded-[14px] px-2.5 text-[14px] font-bold text-destructive hover:bg-card"
      >
        <LogOut className="size-[18px]" aria-hidden />
        {strings.nav.signOut}
      </button>
    </form>
  );
}

/** Shared rows for the account menu: profile, free-only, theme, guide, credits, sign out. */
export function AccountMenuItems({ userId, freeOnly, onNavigate }: { userId: string; freeOnly: boolean; onNavigate?: () => void }) {
  return (
    <div className="flex flex-col gap-1">
      <Link
        href="/profile"
        onClick={onNavigate}
        className="flex min-h-11 items-center rounded-[14px] px-2.5 text-[14px] font-bold hover:bg-card"
      >
        {strings.nav.profile}
      </Link>
      <div className="px-0.5"><FreeOnlyToggle freeOnly={freeOnly} /></div>
      <div className="px-0.5"><ThemeToggle withLabel className="w-full justify-start" /></div>
      <Link
        href="/guide"
        onClick={onNavigate}
        className="flex min-h-11 items-center rounded-[14px] px-2.5 text-[14px] font-bold hover:bg-card"
      >
        {strings.guide.title}
      </Link>
      <Link
        href="/credits"
        onClick={onNavigate}
        className="flex min-h-11 items-center rounded-[14px] px-2.5 text-[14px] font-bold hover:bg-card"
      >
        {strings.credits.link}
      </Link>
      <SignOutRow userId={userId} />
    </div>
  );
}

/** Account dropdown for desktop (sidebar footer + topbar avatar). */
export function AccountMenu({ data, userId, variant = 'full' }: { data: ShellData; userId: string; variant?: 'full' | 'icon' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={variant === 'icon' ? strings.nav.profile : undefined}
        className={cn(
          'flex min-w-0 items-center gap-2.5 rounded-full',
          variant === 'full' && 'w-full px-1 py-0.5 hover:bg-card/60',
        )}
      >
        <Avatar name={data.user.name} className={variant === 'icon' ? 'bg-primary text-primary-foreground ring-0' : undefined} />
        {variant === 'full' && (
          <span className="min-w-0 flex-1 text-left">
            <span className="block truncate text-[14px] font-bold">{data.user.name}</span>
            {data.user.city && <span className="block truncate text-[12.5px] text-muted-foreground">{data.user.city}</span>}
          </span>
        )}
        {variant === 'full' && <ChevronDown className={cn('size-4 shrink-0 text-muted-foreground transition-transform', open && 'rotate-180')} aria-hidden />}
      </button>
      {open && (
        <div
          role="menu"
          className={cn(
            'absolute z-40 w-64 rounded-[20px] bg-card p-2 shadow-card ring-1 ring-border',
            variant === 'icon' ? 'right-0 top-12' : 'bottom-full left-0 mb-2',
          )}
        >
          <AccountMenuItems userId={userId} freeOnly={data.freeOnly} onNavigate={() => setOpen(false)} />
        </div>
      )}
    </div>
  );
}
