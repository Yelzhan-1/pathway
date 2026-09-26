'use client';
import { motion } from 'motion/react';
import type { ReactNode } from 'react';
import { usePrefs } from '@/lib/prefs';

/**
 * Hand-drawn accents (own SVG strokes, drawn once with pathLength, ~0.7s).
 * Decorative → aria-hidden. Use sparingly: max 1–2 per screen.
 */
type Color = 'honey' | 'forest' | 'ink';
const C: Record<Color, string> = { honey: 'var(--honey-600)', forest: 'var(--color-forest-500)', ink: 'var(--ink-2)' };

function Stroke({ d, color, width, delay, dur = 0.7 }: { d: string; color: Color; width: number; delay: number; dur?: number }) {
  const { reduced } = usePrefs();
  return (
    <motion.path d={d} fill="none" stroke={C[color]} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke"
      initial={{ pathLength: reduced ? 1 : 0, opacity: reduced ? 1 : 0 }} animate={{ pathLength: 1, opacity: 1 }}
      transition={{ pathLength: { duration: reduced ? 0 : dur, delay, ease: [0.65, 0, 0.35, 1] }, opacity: { duration: 0.01, delay } }} />
  );
}

/** Wraps text with a wobbly underline. */
export function Underline({ children, color = 'honey', delay = 0.6, className = '' }: { children: ReactNode; color?: Color; delay?: number; className?: string }) {
  return (
    <span className={`relative inline-block whitespace-nowrap ${className}`}>
      {children}
      <svg aria-hidden viewBox="0 0 200 14" preserveAspectRatio="none" className="pointer-events-none absolute -bottom-[0.28em] left-[-2%] h-[0.42em] w-[104%] overflow-visible">
        <Stroke d="M3 9.5C38 5.2 78 3.6 118 5.4S176 9.8 197 6.2" color={color} width={3} delay={delay} />
      </svg>
    </span>
  );
}

/** Loose hand-drawn ellipse around children. */
export function Circled({ children, color = 'honey', delay = 0.6, className = '' }: { children: ReactNode; color?: Color; delay?: number; className?: string }) {
  return (
    <span className={`relative inline-block ${className}`}>
      {children}
      <svg aria-hidden viewBox="0 0 200 60" preserveAspectRatio="none" className="pointer-events-none absolute -inset-x-[10%] -inset-y-[22%] h-[144%] w-[120%] overflow-visible">
        <Stroke d="M152 7C110-1 34 3 13 22-3 38 38 56 102 54 162 52 198 38 189 20 183 9 160 4 128 7" color={color} width={2.4} delay={delay} dur={0.9} />
      </svg>
    </span>
  );
}

/** Curvy arrow. `dir` flips it; size via className (w/h). */
export function Arrow({ color = 'ink', delay = 0.9, className = '', flip = false, rotate = 0 }: { color?: Color; delay?: number; className?: string; flip?: boolean; rotate?: number }) {
  return (
    <svg aria-hidden viewBox="0 0 80 50" className={`pointer-events-none overflow-visible ${className}`} style={{ transform: `${flip ? 'scaleX(-1) ' : ''}rotate(${rotate}deg)` }}>
      <Stroke d="M4 5C14 26 34 40 66 39" color={color} width={2} delay={delay} dur={0.6} />
      <Stroke d="M56 31.5 67 39 56.5 45" color={color} width={2} delay={delay + 0.5} dur={0.25} />
    </svg>
  );
}

/** Handwritten annotation (Caveat). Keep ≤ 5 words. Decorative duplicate of nearby info → aria-hidden by default. */
export function HandNote({ children, className = '', color = 'ink', hidden = true }: { children: ReactNode; className?: string; color?: Color; hidden?: boolean }) {
  const cls = color === 'honey' ? 'text-honey-deep' : color === 'forest' ? 'text-primary' : 'text-ink-2';
  return <span aria-hidden={hidden || undefined} className={`font-hand font-semibold text-[22px] leading-none ${cls} ${className}`}>{children}</span>;
}
