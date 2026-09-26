'use client';
import { useState } from 'react';
import { Check, Download, GripVertical, Lightbulb, Plus, Printer, Trash2 } from 'lucide-react';
import type { CvData } from '@/types/pathway';
import { cn } from '@/lib/utils';
import { Button, Display, TCard } from '../ui/tropa';

const SECTIONS = [
  { id: 'person', label: 'Личное' }, { id: 'summary', label: 'О себе' }, { id: 'education', label: 'Образование' }, { id: 'experience', label: 'Опыт' },
  { id: 'achievements', label: 'Достижения' }, { id: 'skills', label: 'Навыки' }, { id: 'languages', label: 'Языки' },
] as const;

/**
 * CV builder: editor (Tropa style) + live A4 preview. The preview (.cv-print-root) is deliberately PLAIN:
 * Onest, black on white, no tiles/colour/Unbounded — it is what prints and what the PDF export renders. See globals.css @media print.
 */
export function CvBuilderScreen({ data, initialSection = 'experience', done = ['person', 'summary', 'education'] }: { data: CvData; initialSection?: (typeof SECTIONS)[number]['id']; done?: string[] }) {
  const [sec, setSec] = useState<string>(initialSection);
  return (
    <div className="space-y-4">
      <div className="no-print flex flex-wrap items-center gap-3">
        <div className="min-w-0 flex-1">
          <Display as="h1" className="text-[26px] font-bold sm:text-[30px]">Резюме</Display>
          <p className="mt-1 text-[14px] font-semibold text-muted-foreground">Сохраняется само · готово на {data.completeness}%</p>
        </div>
        <Button variant="soft" onClick={() => window.print()}><Printer className="size-4" aria-hidden />Печать</Button>
        <Button><Download className="size-4" aria-hidden />Скачать PDF</Button>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,600px)] xl:items-start">
        <div className="no-print space-y-4">
          <nav aria-label="Разделы резюме" className="flex flex-wrap gap-2">
            {SECTIONS.map((s) => {
              const on = s.id === sec, ok = done.includes(s.id);
              return <button key={s.id} type="button" onClick={() => setSec(s.id)} aria-current={on ? 'step' : undefined} className={cn('press inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full px-4 text-[13.5px] font-bold', on ? 'bg-primary text-primary-foreground shadow-chunky' : 'bg-card ring-1 ring-border shadow-chunky-soft')}>{ok && <Check className="size-3.5" strokeWidth={3} aria-hidden />}{s.label}</button>;
            })}
          </nav>
          <TCard labelledBy="ed-h">
            <div className="flex items-center"><Display id="ed-h" className="text-[18px]">Опыт и активности</Display><span className="ml-auto text-[13px] font-bold text-muted-foreground">{data.experience.length} записи</span></div>
            <p className="mt-1 text-[14px] font-medium text-ink-2">Клубы, волонтёрство, работа, проекты. Начинай с глагола: «собрала», «запустил».</p>
            <ul className="mt-4 space-y-3">
              {data.experience.map((e, k) => (
                <li key={e.id} className={cn('rounded-[20px] p-4 ring-1', k === 0 ? 'bg-background ring-2 ring-primary' : 'bg-background ring-border')}>
                  <div className="flex items-start gap-2">
                    <GripVertical className="mt-3 size-5 shrink-0 text-muted-foreground" aria-hidden />
                    <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-2">
                      <div className="sm:col-span-2"><Field label="Роль" value={e.title} /></div>
                      <Field label="Где" value={e.org} />
                      <Field label="Когда" value={e.period} />
                      {k === 0 && <div className="sm:col-span-2"><span className="text-[12.5px] font-bold text-muted-foreground">Что сделал(а)</span>
                        <div className="mt-1 space-y-1.5 rounded-[14px] bg-card p-3 text-[14px] font-medium ring-1 ring-input">{e.bullets.map((b) => <p key={b}>• {b}</p>)}<p className="text-muted-foreground">• </p></div></div>}
                    </div>
                    <button type="button" aria-label="Удалить запись" className="grid size-10 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-secondary"><Trash2 className="size-[18px]" aria-hidden /></button>
                  </div>
                </li>
              ))}
            </ul>
            <button type="button" className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-[18px] border-2 border-dashed border-input text-[14.5px] font-bold text-primary hover:bg-secondary"><Plus className="size-4" aria-hidden />Добавить опыт</button>
          </TCard>
          <TCard surface="honey" as="div">
            <div className="flex items-start gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-[13px] bg-card text-honey-deep" aria-hidden><Lightbulb className="size-5" /></span>
              <p className="text-[14px] font-semibold leading-snug"><b>Совет:</b> добавь цифры — «команда из 12 человек», «финал турнира». Приёмные комиссии любят конкретику.</p></div>
          </TCard>
        </div>

        <div className="xl:sticky xl:top-4">
          <p className="no-print mb-2 text-[13px] font-bold text-muted-foreground">Так будет в PDF · A4</p>
          <CvSheet data={data} />
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <label className="block"><span className="text-[12.5px] font-bold text-muted-foreground">{label}</span>
      <input defaultValue={value} className="mt-1 h-11 w-full rounded-[14px] bg-card px-3 text-[14.5px] font-semibold ring-1 ring-input focus:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
    </label>
  );
}

/** A4 sheet — plain on purpose (prints 1:1). Always light, even in dark theme. */
export function CvSheet({ data }: { data: CvData }) {
  const H = ({ children }: { children: string }) => <h3 className="mb-1.5 border-b border-[#222] pb-1 text-[11px] font-bold uppercase tracking-[0.08em]">{children}</h3>;
  return (
    <article className="cv-print-root mx-auto aspect-[210/297] w-full max-w-[600px] overflow-hidden rounded-[6px] bg-white p-[7%] font-sans text-[10.5px] leading-[1.45] text-[#111] shadow-lift ring-1 ring-black/10" aria-label="Предпросмотр резюме">
      <header>
        <h2 className="text-[22px] font-bold leading-tight tracking-[-0.01em]">{data.person.name}</h2>
        <p className="mt-0.5 text-[12px]">{data.person.headline}</p>
        <p className="mt-1 text-[10px] text-[#444]">{[data.person.city, data.person.email, data.person.phone, ...(data.person.links ?? [])].filter(Boolean).join('  ·  ')}</p>
      </header>
      <section className="mt-4"><H>О себе</H><p>{data.summary}</p></section>
      <section className="mt-3.5"><H>Образование</H>{data.education.map((e) => <Entry key={e.id} e={e} />)}</section>
      <section className="mt-3.5"><H>Опыт и активности</H>{data.experience.map((e) => <Entry key={e.id} e={e} />)}</section>
      <section className="mt-3.5"><H>Достижения</H><ul className="list-disc pl-4">{data.achievements.map((a) => <li key={a}>{a}</li>)}</ul></section>
      <section className="mt-3.5 grid grid-cols-2 gap-4">
        <div><H>Навыки</H><p>{data.skills.join(', ')}</p></div>
        <div><H>Языки</H><p>{data.languages.map((l) => `${l.name} — ${l.level}`).join('; ')}</p></div>
      </section>
    </article>
  );
}
function Entry({ e }: { e: CvData['education'][number] }) {
  return (
    <div className="mb-2">
      <div className="flex justify-between gap-3"><p><b>{e.title}</b>, {e.org}</p><p className="shrink-0 text-[#444]">{e.period}</p></div>
      <ul className="list-disc pl-4">{e.bullets.map((b) => <li key={b}>{b}</li>)}</ul>
    </div>
  );
}
