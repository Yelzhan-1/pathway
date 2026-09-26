'use client';
import { useId } from 'react';
import { motion } from 'motion/react';
import { Num } from './Num';
import { usePrefs } from '@/lib/prefs';

/** Readiness ring: motion pathLength spring + Count Up. Colors come from CSS vars → works in dark mode. */
export function Ring({ value, size = 148, stroke = 12, delay = 0.3, label, from = 0 }: { value: number; size?: number; stroke?: number; delay?: number; label?: string; from?: number }) {
  const { reduced } = usePrefs();
  const id = 'rg' + useId().replace(/:/g, '');
  const sw = stroke / (size / 100);
  const r = 50 - sw / 2;
  const big = size >= 120;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} role="img" aria-label={`Готовность ${value}%`}>
      <svg viewBox="0 0 100 100" className="size-full -rotate-90" aria-hidden>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--color-forest-400)" />
            <stop offset="100%" stopColor="var(--primary)" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--secondary)" strokeWidth={sw} />
        <motion.circle cx="50" cy="50" r={r} fill="none" stroke={`url(#${id})`} strokeWidth={sw} strokeLinecap="round"
          initial={{ pathLength: reduced ? value / 100 : from / 100 }} animate={{ pathLength: value / 100 }}
          transition={{ type: 'spring', stiffness: 38, damping: 16, delay: reduced ? 0 : delay }} />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center" aria-hidden>
        <div>
          <div className={`${big ? 'text-[40px]' : 'text-[22px]'} font-extrabold leading-none tracking-[-0.04em]`}>
            <Num from={from} to={value} delay={delay} duration={1.6} /><span className={big ? 'text-[20px]' : 'text-[13px]'}>%</span>
          </div>
          {label && <div className={`${big ? 'mt-1 text-[12px]' : 'mt-0.5 text-[10px]'} font-semibold text-muted-foreground`}>{label}</div>}
        </div>
      </div>
    </div>
  );
}
