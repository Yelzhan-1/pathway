'use client';
import { useEffect, type ReactNode } from 'react';
import { MotionConfig } from 'motion/react';
import { usePrefs } from '@/lib/prefs';

/**
 * Wrap the app once (in layout.tsx).
 *  - MotionConfig: every motion/react animation respects reduced motion.
 *  - `lite` class on <html>: CSS hooks for Save-Data / slow network / low-memory devices.
 * Dark mode is NOT handled here — use next-themes with attribute="class" (globals.css expects `.dark`).
 */
export function PathwayProviders({ children }: { children: ReactNode }) {
  const { reduced, lite } = usePrefs();
  useEffect(() => { document.documentElement.classList.toggle('lite', lite); }, [lite]);
  return <MotionConfig reducedMotion={reduced ? 'always' : 'user'}>{children}</MotionConfig>;
}
