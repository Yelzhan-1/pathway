'use client';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

/** Class theme toggle via next-themes (`attribute="class"` on `<html>`). */
export function ThemeToggle({ className, withLabel = false }: { className?: string; withLabel?: boolean }) {
  const { setTheme } = useTheme();
  const toggle = () => {
    const dark = document.documentElement.classList.contains('dark');
    setTheme(dark ? 'light' : 'dark');
  };
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Переключить тему"
      className={cn('inline-flex h-11 min-w-11 items-center justify-center gap-2 rounded-full bg-card ring-1 ring-border hover:ring-input', withLabel && 'px-4 text-[14px] font-bold', className)}
    >
      <Sun className="hidden size-[18px] dark:block" aria-hidden />
      <Moon className="size-[18px] dark:hidden" aria-hidden />
      {withLabel && <span className="hidden dark:inline">Светлая тема</span>}
      {withLabel && <span className="dark:hidden">Тёмная тема</span>}
    </button>
  );
}
