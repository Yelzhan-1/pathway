'use client';
import { useSyncExternalStore } from 'react';

/**
 * Motion / bandwidth preferences shared by all Pathway effects.
 * SSR-safe: the server snapshot is "full motion, not lite"; the client re-renders
 * with real values right after hydration (useSyncExternalStore handles the switch).
 *  - reduced: prefers-reduced-motion OR ?reduced
 *  - lite:    ?lite OR Save-Data OR 2g/3g OR deviceMemory ≤ 2  → no WebGL, no photos marked hideInLite, fewer particles
 */
export type Prefs = { reduced: boolean; lite: boolean; finePointer: boolean };
const SERVER: Prefs = { reduced: false, lite: false, finePointer: false };
let cache: Prefs | null = null;

type NetworkInformation = { saveData?: boolean; effectiveType?: string };
type NavigatorPrefs = Navigator & { connection?: NetworkInformation; deviceMemory?: number };

function read(): Prefs {
  const q = new URLSearchParams(location.search);
  const nav = navigator as NavigatorPrefs;
  const conn = nav.connection;
  const slowNet = !!conn && (conn.saveData || /(^|-)2g|3g/.test(conn.effectiveType || ''));
  const lowMem = (nav.deviceMemory ?? 8) <= 2;
  return {
    reduced: q.has('reduced') || matchMedia('(prefers-reduced-motion: reduce)').matches,
    lite: q.has('lite') || slowNet || lowMem,
    finePointer: matchMedia('(hover: hover) and (pointer: fine)').matches,
  };
}
function snapshot(): Prefs {
  if (!cache) cache = read();
  return cache;
}
function subscribe(cb: () => void) {
  const mq = matchMedia('(prefers-reduced-motion: reduce)');
  const on = () => { cache = read(); cb(); };
  mq.addEventListener('change', on);
  return () => mq.removeEventListener('change', on);
}
export function usePrefs(): Prefs {
  return useSyncExternalStore(subscribe, snapshot, () => SERVER);
}
/** Non-hook read for event handlers (client only). */
export function getPrefs(): Prefs { return typeof window === 'undefined' ? SERVER : snapshot(); }

export function webglOK() {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; }
}
