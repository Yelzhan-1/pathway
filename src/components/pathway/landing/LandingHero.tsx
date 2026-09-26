import Link from 'next/link';
import { Check, Heart, Menu } from 'lucide-react';
import type { LandingData, RoadStep } from '@/types/pathway';
import { Photo } from '../primitives/Photo';
import { Ring } from '../primitives/Ring';
import { Arrow, HandNote } from '../primitives/Scribble';
import { Button, Display, Logo } from '../ui/tropa';
import { Flag } from '../ui/Flag';
import { UniMonogram } from '../ui/UniMonogram';
import { MapScenery, ProgressRoad } from '../dashboard/ProgressRoad';

const PREVIEW_ROAD: RoadStep[] = [
  { id: 'a', title: 'Профиль', status: 'done' }, { id: 'b', title: 'Резюме', status: 'done' },
  { id: 'c', title: 'Выбери вузы', status: 'current' }, { id: 'd', title: 'IELTS', status: 'locked' }, { id: 'e', title: 'Эссе', status: 'locked' },
];

/** Landing header + hero «Тропа». Right side = product preview on the map (clearly marked «пример»), not fake users. */
export function LandingHero({ data }: { data: LandingData }) {
  return (
    <div className="relative overflow-hidden bg-background">
      <header className="mx-auto flex h-[72px] max-w-[1240px] items-center gap-6 px-5 lg:px-10">
        <Logo />
        <nav className="ml-6 hidden gap-1 text-[15px] font-bold text-ink-2 lg:flex" aria-label="Разделы">
          {['Как это работает', 'Вузы', 'Для родителей'].map((l) => <Link key={l} href="#" className="inline-flex h-11 items-center rounded-full px-3 hover:bg-secondary">{l}</Link>)}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Button href="/login" variant="ghost" className="hidden sm:inline-flex">Войти</Button>
          <Button href="/signup" size="md" className="hidden sm:inline-flex">Начать</Button>
          <button type="button" aria-label="Меню" className="grid size-11 place-items-center rounded-full bg-card ring-1 ring-border sm:hidden"><Menu className="size-5" aria-hidden /></button>
        </div>
      </header>

      <section className="mx-auto grid max-w-[1240px] gap-10 px-5 pb-16 pt-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,620px)] lg:items-center lg:px-10 lg:pt-16" aria-labelledby="lh">
        <div>
          <p className="flex items-center gap-1"><HandNote color="honey" className="text-[25px]">{data.kicker}</HandNote><Arrow color="honey" className="h-7 w-10 translate-y-2" rotate={10} /></p>
          <Display as="h1" id="lh" className="mt-3 text-[38px] font-bold leading-[1.05] tracking-[-0.035em] sm:text-[50px] lg:text-[54px]">
            {data.title[0]}<br /><span className="relative inline-block whitespace-nowrap text-primary">{data.title[1]}<svg aria-hidden viewBox="0 0 300 16" preserveAspectRatio="none" className="absolute -bottom-2 left-0 h-3 w-full"><path d="M4 11C70 4 160 3 296 8" stroke="var(--honey)" strokeWidth="6" strokeLinecap="round" fill="none" /></svg></span>
          </Display>
          <p className="mt-6 max-w-[500px] text-[17px] font-medium leading-relaxed text-ink-2 sm:text-[18px]">{data.lead}</p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Button href="/signup" size="lg" variant="honey" icon>{data.cta}</Button>
            <Button href="#how" size="lg" variant="soft">{data.secondary}</Button>
          </div>
          <ul className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-[14.5px] font-bold">
            {data.bullets.map((b) => <li key={b} className="flex items-center gap-2"><span className="grid size-6 place-items-center rounded-full bg-tone-mint-bg text-tone-mint-fg" aria-hidden><Check className="size-3.5" strokeWidth={3} /></span>{b}</li>)}
          </ul>
        </div>

        <div className="relative">
          <div className="relative overflow-hidden rounded-[32px] shadow-lift ring-1 ring-border">
            <MapScenery />
            <ProgressRoad steps={PREVIEW_ROAD} finish="Финиш · заявки" className="relative [&>div:last-child]:p-5" />
            <span className="absolute bottom-4 right-4 rounded-full bg-card/95 px-3 py-1 text-[12px] font-bold text-tone-dream-fg ring-1 ring-border">пример маршрута</span>
          </div>
          {/* floating widgets (desktop only, not tilted on mobile) */}
          <div className="absolute -left-8 top-8 hidden w-[190px] rounded-[20px] bg-card p-3 shadow-lift ring-1 ring-border lg:block lg:-rotate-2">
            <div className="flex items-start justify-between"><UniMonogram id="kaist" text="KAIST" size={38} /><Heart className="size-5 fill-honey text-honey-600" aria-hidden /></div>
            <p className="mt-2 text-[14px] font-bold">KAIST</p><p className="flex items-center gap-1.5 text-[12px] font-semibold text-muted-foreground"><Flag code="KR" />Тэджон · Стипендия</p>
          </div>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <div className="flex items-center gap-3 rounded-[20px] bg-card p-3 pr-5 shadow-card ring-1 ring-border">
            <Ring value={72} size={62} stroke={9} delay={0.6} /><div><p className="font-display text-[13px] font-semibold">Сила профиля</p><p className="text-[12px] font-semibold text-muted-foreground">пример · +3 поля до «Готов»</p></div>
          </div>
          <figure className="flex flex-1 items-center gap-3 rounded-[20px] bg-card p-2.5 shadow-card ring-1 ring-border">
            <Photo img={data.photo} sizes="120px" hideInLite rounded="rounded-[14px]" className="aspect-[16/10] w-[104px] shrink-0" />
            <figcaption className="text-[12px] font-semibold leading-snug text-muted-foreground"><b className="block text-[13px] text-foreground">Назарбаев Университет</b>один из 35 вузов каталога<span className="mt-0.5 block text-[10.5px]">Фото: {data.photo.credit}</span></figcaption>
          </figure>
          </div>
        </div>
      </section>
      <section id="how" aria-label="Как это работает" className="mx-auto grid max-w-[1240px] gap-4 px-5 pb-16 sm:grid-cols-3 lg:px-10">
        {([['1', 'Профиль за 3 минуты', '10 простых вопросов: класс, оценки, язык, страны, бюджет.', 'bg-tone-mint-bg text-tone-mint-fg'], ['2', 'Вузы под тебя', 'Каталог вузов Казахстана и мира с грантами и требованиями.', 'bg-tone-honey-bg text-tone-honey-fg'], ['3', 'Тропа до заявки', 'Экзамены, документы и сроки — по шагам, с напоминаниями.', 'bg-tone-sky-bg text-tone-sky-fg']] as const).map(([n, t, d, c]) => (
          <div key={n} className="flex gap-4 rounded-[26px] bg-card p-5 shadow-card ring-1 ring-border">
            <span className={`grid size-12 shrink-0 place-items-center rounded-[16px] font-display text-[20px] font-bold ${c}`} aria-hidden>{n}</span>
            <div><h2 className="font-display text-[16px] font-semibold">{t}</h2><p className="mt-1 text-[14px] font-medium leading-snug text-ink-2">{d}</p></div>
          </div>
        ))}
      </section>
    </div>
  );
}
