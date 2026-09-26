'use client';
import CountUp from '@/components/react-bits/CountUp';
import { usePrefs } from '@/lib/prefs';

/** React Bits · Count Up; renders the final number when reduced. */
export function Num({ to, from = 0, delay = 0, duration = 1.6, className = '' }: { to: number; from?: number; delay?: number; duration?: number; className?: string }) {
  const { reduced } = usePrefs();
  if (reduced) return <span className={`tnum ${className}`}>{to}</span>;
  return <CountUp from={from} to={to} delay={delay} duration={duration} className={`tnum ${className}`} />;
}
