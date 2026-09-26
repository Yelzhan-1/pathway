'use client';
import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, BookOpen, Briefcase, Building, Calendar, ChartLine, Check, Code2, FlaskConical, Globe2, GraduationCap, HeartPulse, Languages, NotebookPen, Palette, PencilLine, School, Star, Wallet, X } from 'lucide-react';
import ClickSpark from '@/components/react-bits/ClickSpark';
import type { OnboardingAnswers, OnboardingData, OnboardingIcon, OnboardingStep } from '@/types/pathway';
import { cn } from '@/lib/utils';
import { usePrefs } from '@/lib/prefs';
import { Button, Display, Logo } from '../ui/tropa';
import { Flag } from '../ui/Flag';
import { HandNote } from '../primitives/Scribble';
import { Ring } from '../primitives/Ring';
import { Signpost } from '../ui/illustrations';
import { RoadProgress } from './RoadProgress';

const ICON: Record<OnboardingIcon, typeof School> = { school: School, grad: GraduationCap, work: Briefcase, city: Building, book: BookOpen, star: Star, globe: Globe2, wallet: Wallet, calendar: Calendar, lang: Languages, exam: NotebookPen, code: Code2, heart: HeartPulse, flask: FlaskConical, chart: ChartLine, palette: Palette };
const TONES = ['bg-tone-mint-bg text-tone-mint-fg', 'bg-tone-honey-bg text-tone-honey-fg', 'bg-tone-sky-bg text-tone-sky-fg', 'bg-tone-dream-bg text-tone-dream-fg', 'bg-tone-coral-bg text-tone-coral-fg'];

/**
 * Onboarding «Тропа» — the real 10 questions + summary. Mini-road progress on top, one question per screen,
 * chunky option cards (radio / checkbox semantics), React Bits · Click Spark on select, «Дальше» chunky button.
 * Desktop: centred column 760px + hills band at the bottom. Mobile: same column, sticky footer.
 * Persist answers after each step (server action) so «Сохранить и выйти» never loses data.
 */
export function OnboardingFlow({ data, initialStep = 0, initialAnswers = {}, onFinish, onExit }: { data: OnboardingData; initialStep?: number; initialAnswers?: OnboardingAnswers; onFinish?: (a: OnboardingAnswers) => void; onExit?: () => void }) {
  const { reduced } = usePrefs();
  const [i, setI] = useState(initialStep);
  const [a, setA] = useState<OnboardingAnswers>(initialAnswers);
  const step = data.steps[i];
  const val = a[step.id];
  const answered = step.kind === 'summary' || (Array.isArray(val) ? val.length > 0 : !!val);
  const last = i === data.steps.length - 1;
  const next = () => (last ? onFinish?.(a) : setI(i + 1));
  return (
    <div className="relative flex min-h-dvh flex-col overflow-x-clip bg-background">
      <header className="mx-auto flex h-16 w-full max-w-[1120px] items-center gap-3 px-4 sm:h-[72px] sm:px-8">
        <button type="button" onClick={() => setI(Math.max(0, i - 1))} disabled={i === 0} aria-label="Назад" className="grid size-11 place-items-center rounded-full bg-card ring-1 ring-border disabled:opacity-40 sm:hidden"><ArrowLeft className="size-5" aria-hidden /></button>
        <Logo className="hidden sm:inline-flex" />
        <span className="ml-auto text-[13.5px] font-semibold text-muted-foreground">{data.duration}</span>
        <button type="button" onClick={onExit} className="inline-flex h-11 items-center gap-1.5 rounded-full px-3 text-[14px] font-bold text-primary hover:bg-secondary"><X className="size-4 sm:hidden" aria-hidden /><span className="hidden sm:inline">Сохранить и выйти</span><span className="sr-only sm:hidden">Сохранить и выйти</span></button>
      </header>
      <div className="mx-auto w-full max-w-[1000px] px-4 pb-4 pt-1 sm:px-8 sm:pb-10">
        <RoadProgress labels={data.steps.map((s) => s.nav)} current={i} onJump={setI} />
      </div>

      <main className="relative z-10 mx-auto flex w-full max-w-[760px] flex-1 flex-col px-4 pb-6 sm:px-8">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={step.id} initial={reduced ? false : { opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={reduced ? undefined : { opacity: 0, x: -24 }} transition={{ type: 'spring', stiffness: 320, damping: 32 }}>
            <p className="text-[13.5px] font-bold text-forest-700 dark:text-forest-300">Шаг {i + 1} из {data.steps.length}</p>
            <Display as="h1" className="mt-1 text-[24px] font-bold leading-[1.15] sm:text-[32px]">{step.question}</Display>
            {step.hint && <p className="mt-2 text-[15.5px] font-medium text-ink-2">{step.hint}</p>}
            <div className="mt-6">
              {step.kind === 'single' || step.kind === 'multi' ? <Options step={step} value={val} onChange={(v) => setA({ ...a, [step.id]: v })} /> : null}
              {step.kind === 'number' && step.number && <NumberField step={step} value={(val as string) ?? ''} onChange={(v) => setA({ ...a, [step.id]: v })} />}
              {step.kind === 'summary' && <Summary data={data} answers={a} onEdit={setI} />}
            </div>
          </motion.div>
        </AnimatePresence>
        <div className="sticky bottom-0 mt-auto flex items-center gap-3 bg-gradient-to-t from-background via-background to-transparent pb-[max(env(safe-area-inset-bottom),8px)] pt-8 sm:static sm:mt-10 sm:bg-none sm:pt-0">
          <Button variant="soft" size="lg" onClick={() => setI(Math.max(0, i - 1))} disabled={i === 0} className="hidden sm:inline-flex">Назад</Button>
          {step.kind !== 'summary' && <button type="button" onClick={next} className="hidden h-14 items-center rounded-full px-4 text-[15px] font-bold text-muted-foreground hover:bg-secondary sm:ml-auto sm:inline-flex">Пропустить</button>}
          <Button size="lg" onClick={next} disabled={!answered} className="flex-1 sm:flex-none sm:min-w-[220px]" icon={!last}>{last ? 'Всё верно, к плану' : 'Дальше'}</Button>
        </div>
      </main>
      {/* xl side decorations: live profile completeness (real: answered / 10) + signpost */}
      <aside className="absolute right-8 top-[190px] z-10 hidden w-[240px] rounded-[26px] bg-card p-4 shadow-card ring-1 ring-border xl:block" aria-label="Профиль заполняется">
        <div className="flex items-center gap-3"><Ring value={Math.round((data.steps.slice(0, -1).filter((s) => { const v = a[s.id]; return Array.isArray(v) ? v.length : !!v; }).length / (data.steps.length - 1)) * 100)} size={64} stroke={9} delay={0} />
          <p className="font-display text-[13.5px] font-semibold leading-snug">Профиль растёт</p></div>
        <ul className="mt-3 space-y-1.5 text-[13px]">
          {data.steps.slice(0, i).filter((s) => s.kind !== 'summary').slice(-4).map((s) => { const v = a[s.id]; const t = (Array.isArray(v) ? v : v ? [v] : []).map((x) => s.options?.find((o) => o.id === x)?.label ?? x).join(', '); return (
            <li key={s.id} className="flex items-center gap-2"><Check className="size-3.5 shrink-0 text-success" strokeWidth={3} aria-hidden /><span className="text-muted-foreground">{s.nav}:</span><span className="truncate font-bold">{t || '—'}</span></li>); })}
        </ul>
      </aside>
      <div className="pointer-events-none absolute left-10 top-[250px] hidden xl:block" aria-hidden>
        <HandNote color="honey" className="block rotate-[-6deg] text-[23px]">ответы можно поменять</HandNote>
        <Signpost className="mt-3 w-[150px]" />
      </div>
      <HillsBand />
    </div>
  );
}

function Options({ step, value, onChange }: { step: OnboardingStep; value: string | string[] | undefined; onChange: (v: string | string[]) => void }) {
  const multi = step.kind === 'multi';
  const sel = (id: string) => (multi ? Array.isArray(value) && value.includes(id) : value === id);
  const toggle = (id: string) => {
    if (!multi) return onChange(id);
    const cur = Array.isArray(value) ? value : [];
    onChange(cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]);
  };
  return (
    <ClickSpark sparkColor="#28AC84" sparkSize={9} sparkRadius={22} sparkCount={9} duration={420}>
      <div role={multi ? 'group' : 'radiogroup'} aria-label={step.question} className="grid gap-3 sm:grid-cols-2">
        {step.options?.map((o, k) => {
          const on = sel(o.id); const I = o.icon ? ICON[o.icon] : null; const noted = step.note?.optionId === o.id;
          return (
            <div key={o.id} className="relative">
              <button type="button" role={multi ? 'checkbox' : 'radio'} aria-checked={on} onClick={() => toggle(o.id)}
                className={cn('press flex min-h-[64px] w-full items-center gap-3 rounded-[20px] px-4 py-3 text-left ring-2 transition-colors', on ? 'bg-secondary ring-primary shadow-[0_4px_0_var(--chunk-primary)]' : 'bg-card ring-border shadow-chunky-soft hover:ring-input')}>
                {o.country ? <span className="grid size-10 shrink-0 place-items-center rounded-[13px] bg-background ring-1 ring-border" aria-hidden><Flag code={o.country} className="scale-125" /></span>
                  : I ? <span className={cn('grid size-10 shrink-0 place-items-center rounded-[13px]', TONES[k % TONES.length])} aria-hidden><I className="size-5" strokeWidth={2.4} /></span> : null}
                <span className="min-w-0 flex-1 text-[16px] font-bold leading-tight">{o.label}{o.hint && <span className="mt-0.5 block text-[13px] font-medium text-muted-foreground">{o.hint}</span>}</span>
                <span className={cn('grid size-6 shrink-0 place-items-center border-2', multi ? 'rounded-[8px]' : 'rounded-full', on ? 'border-primary bg-primary text-primary-foreground' : 'border-input')} aria-hidden>{on && <Check className="size-3.5" strokeWidth={3.5} />}</span>
              </button>
              {noted && step.note && <HandNote color="honey" className="pointer-events-none absolute -top-6 right-12 rotate-[-4deg] text-[21px]">{step.note.text}</HandNote>}
            </div>
          );
        })}
      </div>
    </ClickSpark>
  );
}

function NumberField({ step, value, onChange }: { step: OnboardingStep; value: string; onChange: (v: string) => void }) {
  const n = step.number!;
  return (
    <div className="rounded-[24px] bg-card p-5 shadow-card ring-1 ring-border">
      <label className="flex items-baseline gap-2">
        <span className="sr-only">{step.question}</span>
        <input inputMode="decimal" value={value} onChange={(e) => onChange(e.target.value.replace(',', '.'))} placeholder={n.placeholder} className="w-40 bg-transparent font-display text-[48px] font-semibold tracking-[-0.03em] outline-none placeholder:text-input" />
        {n.suffix && <span className="text-[18px] font-bold text-muted-foreground">{n.suffix}</span>}
      </label>
      <input type="range" min={n.min} max={n.max} step={n.step} value={value || n.min} onChange={(e) => onChange(e.target.value)} aria-label="Ползунок" className="mt-3 w-full accent-[var(--primary)]" />
    </div>
  );
}

function Summary({ data, answers, onEdit }: { data: OnboardingData; answers: OnboardingAnswers; onEdit: (i: number) => void }) {
  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {data.steps.slice(0, -1).map((s, k) => {
        const v = answers[s.id]; const labels = (Array.isArray(v) ? v : v ? [v] : []).map((x) => s.options?.find((o) => o.id === x)?.label ?? `${x}${s.number?.suffix ? ' ' + s.number.suffix : ''}`);
        return (
          <li key={s.id} className="flex items-center gap-3 rounded-[18px] bg-card px-4 py-3 ring-1 ring-border">
            <span className="min-w-0 flex-1"><span className="block text-[12px] font-bold text-muted-foreground">{s.nav}</span><span className={cn('block truncate text-[15px] font-bold', !labels.length && 'text-honey-deep')}>{labels.join(', ') || 'Пропущено'}</span></span>
            <button type="button" onClick={() => onEdit(k)} aria-label={`Изменить: ${s.nav}`} className="grid size-10 place-items-center rounded-full text-primary hover:bg-secondary"><PencilLine className="size-[18px]" aria-hidden /></button>
          </li>
        );
      })}
    </ul>
  );
}

/** Decorative hills + signpost band at the bottom (hidden on phones to keep focus). */
function HillsBand() {
  return (
    <svg aria-hidden viewBox="0 0 1440 160" preserveAspectRatio="xMidYMax slice" className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-[160px] w-full sm:block">
      <path d="M0 90C200 40 360 60 520 80s320-50 520-40 300 40 400 30v90H0z" fill="var(--map-hill-1)" opacity=".7" />
      <path d="M0 125c220-40 420-20 640 5s460 10 800-25v55H0z" fill="var(--map-hill-2)" opacity=".65" />
      {[[120, 92], [150, 100], [1250, 70], [1285, 78], [980, 60]].map(([x, y], i) => <g key={i}><path d={`M${x} ${y}l11-28 11 28z`} fill={i % 2 ? 'var(--map-tree-2)' : 'var(--map-tree-1)'} /><path d={`M${x + 11} ${y}v7`} stroke="var(--map-trunk)" strokeWidth="2.5" /></g>)}
    </svg>
  );
}
