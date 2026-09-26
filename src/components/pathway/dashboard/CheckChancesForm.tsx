'use client';
import { useMemo, useState } from 'react';
import { ArrowRight, ChevronDown, Lock } from 'lucide-react';
import type { CheckChancesOptions, Option } from '@/types/pathway';
import { filterCheckUniversities } from '@/lib/dashboard/check-filter';
import { Display, TCard, Button } from '../ui/tropa';
import { HandNote } from '../primitives/Scribble';

/**
 * Quick chance check. Native <select>s. options = null → locked preview.
 */
export function CheckChancesForm({ options, onSubmit, pending }: { options: CheckChancesOptions | null; onSubmit?: (v: { program: string; country: string; university: string }) => void; pending?: boolean }) {
  const [v, setV] = useState({ program: options?.defaults?.program ?? '', country: options?.defaults?.country ?? '', university: options?.defaults?.university ?? '' });
  const locked = !options;
  const universities = useMemo(() => {
    if (!options) return [] as Option[];
    return filterCheckUniversities(options.universities, { country: v.country, program: v.program });
  }, [options, v.country, v.program]);
  const universityValue = universities.some((row) => row.value === v.university) ? v.university : '';
  return (
    <TCard surface="forest" labelledBy="cc-h" className="min-w-0 overflow-hidden">
      <span id="check" className="absolute -top-24" aria-hidden />
      <Display id="cc-h" className="text-[16px] text-white">Проверить шансы</Display>
      {!locked && <HandNote className="absolute right-5 top-4 rotate-[-6deg] text-[21px] !text-honey">10 секунд</HandNote>}
      {locked ? (
        <div className="mt-3">
          <div className="grid grid-cols-2 gap-2 opacity-50" aria-hidden>{['Программа', 'Страна'].map((l) => <span key={l} className="flex h-11 items-center rounded-[14px] bg-white/10 px-3 text-[14px] font-bold ring-1 ring-white/25">{l}<ChevronDown className="ml-auto size-4" /></span>)}</div>
          <p className="mt-3 flex items-start gap-2 text-[14px] font-semibold leading-snug text-forest-100"><Lock className="mt-0.5 size-4 shrink-0" aria-hidden />Сначала заполни профиль — шансы считаем по твоим оценкам, языку и бюджету.</p>
          <Button href="/onboarding" variant="honey" className="mt-3 w-full" icon>Заполнить профиль</Button>
        </div>
      ) : (
        <form className="mt-3" onSubmit={(e) => { e.preventDefault(); onSubmit?.({ ...v, university: universityValue }); }}>
          <div className="grid min-w-0 grid-cols-2 gap-2">
            <Select label="Программа" value={v.program} options={options.programs} onChange={(program) => setV({ ...v, program, university: '' })} />
            <Select label="Страна" value={v.country} options={options.countries} onChange={(country) => setV({ ...v, country, university: '' })} />
          </div>
          <Select className="mt-2" label="Вуз" value={universityValue} options={universities} onChange={(university) => setV({ ...v, university })} />
          <button type="submit" disabled={pending || !universityValue} className="press mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-honey text-[15px] font-extrabold text-honey-ink shadow-chunky-honey disabled:opacity-60">
            {pending ? 'Считаем…' : 'Проверить'} <ArrowRight className="size-4" aria-hidden />
          </button>
        </form>
      )}
    </TCard>
  );
}

function Select({ label, value, options, onChange, className = '' }: { label: string; value: string; options: Option[]; onChange: (v: string) => void; className?: string }) {
  return (
    <label className={`relative block min-w-0 ${className}`}>
      <span className="sr-only">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="h-11 w-full min-w-0 appearance-none truncate rounded-[14px] bg-white/12 pl-3 pr-8 text-[14px] font-bold text-white ring-1 ring-white/25 focus-visible:outline-3 focus-visible:outline-honey [&>option]:text-foreground">
        <option value="">{label}</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-white/80" aria-hidden />
    </label>
  );
}
