'use client';
import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * Minimal class-based theme toggle (html.dark + localStorage 'theme').
 * In the app you may swap the body for next-themes: `const { resolvedTheme, setTheme } = useTheme()` with attribute="class".
 */
export function ThemeToggle({ className, withLabel = false }: { className?: string; withLabel?: boolean }) {
  const [dark, setDark] = useState(false);
  useEffect(() => { setDark(document.documentElement.classList.contains('dark')); }, []);
  const toggle = () => {
    const next = !dark; setDark(next);
    document.documentElement.classList.toggle('dark', next);
    try { localStorage.setItem('theme', next ? 'dark' : 'light'); } catch { /* private mode */ }
  };
  const I = dark ? Sun : Moon;
  return (
    <button type="button" onClick={toggle} aria-label={dark ? 'Светлая тема' : 'Тёмная тема'} aria-pressed={dark}
      className={cn('inline-flex h-10 min-w-10 items-center justify-center gap-2 rounded-full bg-card ring-1 ring-border hover:ring-input', withLabel && 'px-4 text-[14px] font-bold', className)}>
      <I className="size-[18px]" aria-hidden />{withLabel && (dark ? 'Светлая тема' : 'Тёмная тема')}
    </button>
  );
}
