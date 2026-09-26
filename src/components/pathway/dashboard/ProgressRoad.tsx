'use client';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Check, Flag as FlagIcon, Lock, Star } from 'lucide-react';
import type { RoadStep } from '@/types/pathway';
import { usePrefs } from '@/lib/prefs';
import { dayMonth } from '@/lib/format';
import { cn } from '@/lib/utils';
import { HandNote } from '../primitives/Scribble';

/**
 * ProgressRoad — the Tropa hero: winding SVG road with steps (done / current / locked).
 *  ≥lg  : illustrated map (aspect 16:9, viewBox 800×450). Nodes are HTML overlays positioned in % of the viewBox → exact at any width.
 *  <lg  : vertical zig-zag list (no tiny map on phones, no tilted text).
 * Motion: road draws in (pathLength 0→1, 1.2 s), nodes pop (spring, stagger 90 ms), current node pulses (CSS, off in reduced/lite).
 * A single step (brand-new user) → road fades into fog with «откроется дальше».
 */
const VW = 800, VH = 450;
type P = { x: number; y: number };
function layout(n: number): P[] {
  if (n === 1) return [{ x: 150, y: 282 }];
  return Array.from({ length: n }, (_, i) => { const t = i / (n - 1); return { x: 95 + t * 590, y: 385 - t * 190 + (i % 2 ? 40 : 0) }; });
}
/** Catmull-Rom → cubic Bézier through points. */
function smooth(pts: P[]) {
  let d = `M${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] ?? p2;
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 }, c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    d += ` C${c1.x.toFixed(1)} ${c1.y.toFixed(1)} ${c2.x.toFixed(1)} ${c2.y.toFixed(1)} ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}
const pct = (p: P) => ({ left: `${(p.x / VW) * 100}%`, top: `${(p.y / VH) * 100}%` });

export function ProgressRoad({ steps, finish, className }: { steps: RoadStep[]; finish?: string | null; className?: string }) {
  if (!steps.length) return null;
  return (
    <div className={className}>
      <RoadMap steps={steps} finish={finish} />
      <RoadList steps={steps} finish={finish} />
    </div>
  );
}

/** Scenery: sky, sun, 3 hill layers, trees. Colours from --map-* tokens (light/dark). Decorative. */
export function MapScenery({ fog = false }: { fog?: boolean }) {
  const trees: [number, number][] = [[48, 330], [66, 340], [300, 262], [318, 272], [520, 214], [650, 170], [770, 190], [190, 380], [740, 350], [420, 330]];
  return (
    <svg viewBox={`0 0 ${VW} ${VH}`} className="absolute inset-0 size-full" aria-hidden preserveAspectRatio="xMidYMid slice">
      <defs><linearGradient id="tr-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="var(--map-sky-1)" /><stop offset="1" stopColor="var(--map-sky-2)" /></linearGradient></defs>
      <rect width={VW} height={VH} fill="url(#tr-sky)" />
      <circle cx="640" cy="58" r="26" fill="var(--honey)" opacity=".9" />
      <circle cx="640" cy="58" r="39" fill="none" stroke="var(--honey)" strokeDasharray="3 8" strokeLinecap="round" opacity=".8" />
      <path d="M520 44q5-5 10 0q5-5 10 0M556 70q4-4 8 0q4-4 8 0" stroke="var(--ink-2)" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity=".5" />
      <path d="M0 330C110 262 205 282 295 300s180-112 295-124 160 36 210 26v248H0z" fill="var(--map-hill-1)" />
      <path d="M0 388c125-50 232-30 338 0s232 20 302-18 124-28 160-18v98H0z" fill="var(--map-hill-2)" />
      <path d="M0 424c160-28 320-10 462 10s250-10 338-20v56H0z" fill="var(--map-hill-3)" opacity=".75" />
      {trees.map(([x, y], i) => <g key={i}><path d={`M${x} ${y}l11-28 11 28z`} fill={i % 2 ? 'var(--map-tree-2)' : 'var(--map-tree-1)'} /><path d={`M${x + 11} ${y}v7`} stroke="var(--map-trunk)" strokeWidth="2.5" /></g>)}
      {fog && <g opacity=".92"><ellipse cx="560" cy="250" rx="260" ry="120" fill="var(--map-sky-1)" /><ellipse cx="700" cy="180" rx="180" ry="110" fill="var(--map-sky-1)" /><ellipse cx="420" cy="300" rx="140" ry="70" fill="var(--map-sky-1)" opacity=".8" /></g>}
    </svg>
  );
}

function RoadMap({ steps, finish }: { steps: RoadStep[]; finish?: string | null }) {
  const { reduced, lite } = usePrefs();
  const still = reduced || lite;
  const pts = layout(steps.length);
  const single = steps.length === 1;
  const flag: P = { x: 752, y: 96 };
  const road = smooth([{ x: 18, y: 432 }, ...pts, ...(single ? [{ x: 330, y: 250 }, { x: 500, y: 215 }] : [flag])]);
  return (
    <div className="relative hidden aspect-[16/9] w-full lg:block">
      <svg viewBox={`0 0 ${VW} ${VH}`} className="absolute inset-0 size-full" aria-hidden>
        <motion.path d={road} fill="none" stroke="var(--map-road)" strokeWidth="26" strokeLinecap="round" opacity={0.95}
          initial={{ pathLength: still ? 1 : 0 }} animate={{ pathLength: 1 }} transition={{ duration: still ? 0 : 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.15 }} />
        <motion.path d={road} fill="none" stroke="var(--map-dash)" strokeWidth="3" strokeDasharray="2 12" strokeLinecap="round"
          initial={{ opacity: still ? 1 : 0 }} animate={{ opacity: single ? 0.5 : 1 }} transition={{ delay: still ? 0 : 1.1, duration: 0.4 }} />
        {!single && <g><path d={`M${flag.x + 14} ${flag.y}V${flag.y - 44}`} stroke="var(--foreground)" strokeWidth="3" strokeLinecap="round" /><path d={`M${flag.x + 14} ${flag.y - 44}l30 9-30 9z`} fill="var(--honey)" /></g>}
        {pts.map((p, i) => {
          const s = steps[i];
          if (s.status === 'current') return (
            <g key={s.id}>
              <circle cx={p.x} cy={p.y} r="50" fill="var(--node-current)" className={still ? '' : 'anim-node-pulse'} opacity=".35" />
              <circle cx={p.x} cy={p.y + 6} r="36" fill="var(--node-current-edge)" /><circle cx={p.x} cy={p.y} r="36" fill="var(--node-current)" />
            </g>
          );
          const done = s.status === 'done';
          return (
            <g key={s.id}>
              <circle cx={p.x} cy={p.y + 5} r="27" fill={done ? 'var(--node-done-edge)' : 'var(--node-locked-edge)'} />
              <circle cx={p.x} cy={p.y} r="27" fill={done ? 'var(--node-done)' : 'var(--node-locked)'} stroke={done ? 'none' : 'var(--node-locked-edge)'} strokeWidth="2" />
            </g>
          );
        })}
      </svg>
      <ol className="absolute inset-0" aria-label="Твой путь">
        {pts.map((p, i) => <Node key={steps[i].id} step={steps[i]} p={p} i={i} still={still} align={p.x > 560 ? 'right' : p.x < 200 ? 'left' : 'center'} />)}
      </ol>
      {finish && !single && <p className="absolute rounded-full bg-card/95 px-3 py-1.5 text-[12.5px] font-bold ring-1 ring-border" style={{ right: '1.5%', top: '24.5%' }}>{finish}</p>}
      {single && <p className="absolute max-w-[260px] rounded-[18px] bg-card/95 px-4 py-3 text-[13.5px] font-semibold text-ink-2 ring-1 ring-border" style={{ left: '58%', top: '60%' }}>Дальше дорога откроется сама: вузы, экзамены, эссе и заявки.</p>}
    </div>
  );
}

function Node({ step, p, i, still, align }: { step: RoadStep; p: P; i: number; still: boolean; align: 'left' | 'center' | 'right' }) {
  const cur = step.status === 'current', done = step.status === 'done';
  const pop = { initial: still ? false : { scale: 0.4, opacity: 0 }, animate: { scale: 1, opacity: 1 }, transition: { type: 'spring' as const, stiffness: 420, damping: 22, delay: still ? 0 : 0.35 + i * 0.09 } };
  const status = done ? 'пройдено' : cur ? 'сейчас' : 'закрыто';
  const Inner = (
    <>
      <motion.span {...pop} className={cn('mx-auto grid place-items-center rounded-full', cur ? 'size-[72px] font-display text-[20px] font-bold text-honey-ink' : 'size-[54px]', done && 'text-primary-foreground', !cur && !done && 'text-[var(--node-locked-icon)]')}>
        {cur ? (step.progress ? `${step.progress.done}/${step.progress.total}` : <Star className="size-7 fill-current" aria-hidden />) : done ? <Check className="size-7" strokeWidth={3.4} aria-hidden /> : <Lock className="size-5" strokeWidth={2.6} aria-hidden />}
      </motion.span>
      {!cur && <span className="mt-1 inline-block whitespace-nowrap rounded-full bg-card/90 px-2.5 py-0.5 text-[12.5px] font-bold">{step.title}{step.due && <span className="ml-1 text-destructive">· {dayMonth(step.due)}</span>}</span>}
      <span className="sr-only">, {status}{step.meta ? `, ${step.meta}` : ''}</span>
    </>
  );
  return (
    <li className="absolute text-center" style={{ ...pct(p), transform: `translate(-50%, ${cur ? -36 : -27}px)` }}>
      {step.href && (cur || done) ? <Link href={step.href} className="block rounded-full" aria-current={cur ? 'step' : undefined}>{Inner}</Link> : <div aria-current={cur ? 'step' : undefined}>{Inner}</div>}
      {cur && (
        <>
          <div className={cn('absolute top-[86px] w-max max-w-[220px] rounded-[18px] bg-foreground px-4 py-3 text-left text-background shadow-lift', align === 'right' ? 'right-0' : align === 'left' ? 'left-0' : 'left-1/2 -translate-x-1/2')}>
            <p className="text-[12px] font-bold text-honey dark:text-[#815200]">Сейчас</p>
            <p className="font-display text-[15px] font-semibold leading-snug">{step.title}</p>
            {step.meta && <p className="mt-0.5 text-[12.5px] font-medium opacity-80">{step.meta}</p>}
            <span aria-hidden className={cn('absolute -top-2 size-4 rotate-45 bg-foreground', align === 'right' ? 'right-7' : align === 'left' ? 'left-7' : 'left-1/2 -ml-2')} />
          </div>
          <HandNote color="honey" className={cn('absolute top-2 rotate-[-8deg] whitespace-nowrap text-[25px]', align === 'left' ? 'left-[82px] top-[22px]' : 'right-[80px]')}>ты здесь</HandNote>
        </>
      )}
    </li>
  );
}

/** Mobile/tablet: vertical zig-zag. Node x alternates 14% / 38%; labels sit to the right, never rotated. */
function RoadList({ steps, finish }: { steps: RoadStep[]; finish?: string | null }) {
  const { reduced, lite } = usePrefs();
  const still = reduced || lite;
  const ROW = 84, xs = [13, 34];
  const H = steps.length * ROW;
  const pts = steps.map((_, i) => ({ x: xs[i % 2], y: i * ROW + ROW / 2 }));
  let d = `M${pts[0].x} 0 L${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) { const a = pts[i - 1], b = pts[i]; d += ` C${a.x} ${a.y + ROW / 2} ${b.x} ${b.y - ROW / 2} ${b.x} ${b.y}`; }
  return (
    <div className="relative lg:hidden">
      <ol aria-label="Твой путь" className="relative" style={{ height: H }}>
        <svg viewBox={`0 0 100 ${H}`} preserveAspectRatio="none" className="absolute inset-0 size-full" aria-hidden>
          <path d={d} fill="none" stroke="var(--map-road)" strokeWidth="22" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          <motion.path d={d} fill="none" stroke="var(--map-dash)" strokeWidth="3" strokeDasharray="2 10" strokeLinecap="round" vectorEffect="non-scaling-stroke"
            initial={{ pathLength: still ? 1 : 0 }} animate={{ pathLength: 1 }} transition={{ duration: still ? 0 : 1, delay: 0.2 }} />
        </svg>
        {steps.map((s, i) => {
          const cur = s.status === 'current', done = s.status === 'done';
          return (
            <li key={s.id} className="absolute flex items-center gap-3" style={{ left: `calc(${pts[i].x}% - ${cur ? 30 : 24}px)`, top: pts[i].y, transform: 'translateY(-50%)', right: 0 }} aria-current={cur ? 'step' : undefined}>
              <span className={cn('relative grid shrink-0 place-items-center rounded-full', cur ? 'size-[60px] bg-[var(--node-current)] font-display text-[16px] font-bold text-honey-ink shadow-[0_5px_0_var(--node-current-edge)]' : 'size-12', done && 'bg-[var(--node-done)] text-primary-foreground shadow-[0_4px_0_var(--node-done-edge)]', !cur && !done && 'bg-[var(--node-locked)] text-[var(--node-locked-icon)] ring-2 ring-[var(--node-locked-edge)]')}>
                {cur && !still && <span aria-hidden className="anim-node-pulse absolute inset-[-8px] rounded-full bg-[var(--node-current)]" />}
                <span className="relative">{cur ? (s.progress ? `${s.progress.done}/${s.progress.total}` : <Star className="size-6 fill-current" aria-hidden />) : done ? <Check className="size-6" strokeWidth={3.4} aria-hidden /> : <Lock className="size-[18px]" strokeWidth={2.6} aria-hidden />}</span>
              </span>
              <span className={cn('min-w-0 rounded-[16px] px-3 py-2', cur ? 'bg-foreground text-background' : 'bg-card/90')}>
                {cur && <span className="block text-[11.5px] font-bold text-honey dark:text-[#815200]">Сейчас</span>}
                <span className={cn('block text-[14px] font-bold leading-tight', cur && 'font-display font-semibold')}>{s.title}</span>
                {(s.meta || s.due) && <span className={cn('block text-[12px] font-semibold', cur ? 'opacity-80' : 'text-muted-foreground')}>{s.meta}{s.due && <span className="text-destructive">{s.meta ? ' · ' : ''}до {dayMonth(s.due)}</span>}</span>}
                <span className="sr-only">{done ? ', пройдено' : cur ? '' : ', закрыто'}</span>
              </span>
            </li>
          );
        })}
      </ol>
      {finish && steps.length > 1 && <p className="mt-2 inline-flex rounded-full bg-card/90 px-3 py-1.5 text-[12.5px] font-bold ring-1 ring-border"><FlagIcon className="mr-1.5 size-4 text-honey-600" aria-hidden />{finish}</p>}
      {steps.length === 1 && <p className="mt-3 rounded-[16px] bg-card/90 px-3 py-2.5 text-[13px] font-semibold text-ink-2 ring-1 ring-border">Дальше дорога откроется сама: вузы, экзамены, эссе и заявки.</p>}
    </div>
  );
}
