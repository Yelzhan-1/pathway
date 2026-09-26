import Link from 'next/link';
import { FileText, Mail, MapPin, PencilLine, Plus } from 'lucide-react';
import type { ProfileData } from '@/types/pathway';
import { cn } from '@/lib/utils';
import { Ring } from '../primitives/Ring';
import { HandNote } from '../primitives/Scribble';
import { NAV_ICON } from '../shell/nav';
import { Avatar } from '../shell/AppShell';
import { Button, Display, IconTile, TCard, WidgetHeader } from '../ui/tropa';
import { MapScenery } from '../dashboard/ProgressRoad';
import { DocumentsBackpack } from '../dashboard/DocumentsBackpack';
import type { DocItem } from '@/types/pathway';

/** Profile (block 2 · NOW). Every field has an anchor id (#gpa) so dashboard «missing» links land on it. Empty fields = honey dashed rows with +N%. */
export function ProfileScreen({ data, docs }: { data: ProfileData; docs: DocItem[] | null }) {
  return (
    <div className="space-y-4">
      <section aria-labelledby="pf-h" className="relative overflow-hidden rounded-[var(--radius-hero)] ring-1 ring-border">
        <MapScenery />
        <div className="relative flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-7">
          <Avatar name={data.name} size={96} className="ring-4 shadow-card" />
          <div className="min-w-0 flex-1">
            <Display as="h1" id="pf-h" className="text-[26px] font-bold sm:text-[32px]">{data.name}</Display>
            <p className="mt-2 flex flex-wrap gap-2 text-[13.5px] font-bold text-ink-2">
              {data.meta && <span className="rounded-full bg-card/90 px-3 py-1 ring-1 ring-border">{data.meta}</span>}
              {data.city && <span className="inline-flex items-center gap-1 rounded-full bg-card/90 px-3 py-1 ring-1 ring-border"><MapPin className="size-3.5" aria-hidden />{data.city}</span>}
              <span className="inline-flex items-center gap-1 rounded-full bg-card/90 px-3 py-1 ring-1 ring-border"><Mail className="size-3.5" aria-hidden />{data.email}</span>
            </p>
          </div>
          <div className="relative flex items-center gap-4 rounded-[24px] bg-card/95 p-4 shadow-card ring-1 ring-border">
            <Ring value={data.strength.percent} size={96} stroke={11} />
            <div><p className="font-display text-[15px] font-semibold">Сила профиля</p><p className="mt-1 max-w-[170px] text-[13px] font-semibold text-muted-foreground">{data.strength.levelLabel}</p></div>
            <HandNote color="honey" className="absolute -top-5 right-4 rotate-[-5deg] text-[22px]">почти готово</HandNote>
          </div>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
        <div className="grid gap-4 xl:grid-cols-2">
          {data.sections.map((s) => (
            <TCard key={s.id} labelledBy={`sec-${s.id}`}>
              <WidgetHeader id={`sec-${s.id}`} title={s.title} icon={NAV_ICON[s.icon]} tone={s.tone} right={<Link href={`/profile/edit#${s.id}`} className="inline-flex min-h-10 items-center gap-1 rounded-full px-2 text-primary hover:bg-secondary"><PencilLine className="size-4" aria-hidden />Изменить</Link>} />
              <dl className="mt-3 space-y-2">
                {s.fields.map((f) => f.value ? (
                  <div key={f.id} id={f.id} className="flex min-h-12 items-center justify-between gap-3 rounded-[14px] bg-background px-3 py-2 ring-1 ring-border">
                    <dt className="text-[13px] font-semibold text-muted-foreground">{f.label}</dt><dd className="text-right text-[14.5px] font-bold">{f.value}</dd>
                  </div>
                ) : (
                  <div key={f.id} id={f.id} className="flex min-h-12 items-center gap-3 rounded-[14px] border-2 border-dashed border-[color-mix(in_oklab,var(--honey-600)_45%,transparent)] bg-honey-soft px-3 py-2">
                    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-card text-honey-deep" aria-hidden><Plus className="size-4" strokeWidth={3} /></span>
                    <span className="min-w-0 flex-1"><dt className="text-[14px] font-bold">{f.label}</dt>{f.hint && <dd className="text-[12.5px] font-semibold text-honey-deep">{f.hint}</dd>}</span>
                    {f.gain && <span className="text-[12.5px] font-extrabold text-success">+{f.gain}%</span>}
                    <Button href={`/profile/edit#${f.id}`} size="sm" variant="soft">Добавить</Button>
                  </div>
                ))}
              </dl>
            </TCard>
          ))}
        </div>
        <div className="space-y-4">
          <TCard surface="honey" labelledBy="cv-h">
            <WidgetHeader id="cv-h" title="Резюме" icon={FileText} tone="sky" right={<span className="text-honey-deep">{data.cv.status === 'ready' ? 'готово' : data.cv.status === 'draft' ? 'черновик' : 'не начато'}</span>} />
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-card" role="progressbar" aria-valuenow={data.cv.percent} aria-valuemin={0} aria-valuemax={100} aria-label="Готовность резюме"><div className="h-full rounded-full bg-primary" style={{ width: `${data.cv.percent}%` }} /></div>
            <p className="mt-2 text-[13.5px] font-semibold text-ink-2">Готово на {data.cv.percent}%{data.cv.updated ? ` · изменено ${data.cv.updated}` : ''}. Осталось добавить навыки и языки.</p>
            <Button href="/cv" className="mt-3 w-full" icon>Открыть конструктор</Button>
          </TCard>
          <DocumentsBackpack docs={docs} />
          <TCard labelledBy="acc-h">
            <Display id="acc-h" className="text-[16px]">Аккаунт</Display>
            <ul className="mt-3 space-y-1 text-[14px] font-bold">
              {['Уведомления', 'Язык интерфейса · Русский', 'Удалить аккаунт'].map((l, k) => <li key={l}><Link href="/settings" className={cn('flex min-h-11 items-center rounded-[12px] px-2 hover:bg-secondary', k === 2 && 'text-destructive')}>{l}</Link></li>)}
            </ul>
          </TCard>
        </div>
      </div>
    </div>
  );
}
