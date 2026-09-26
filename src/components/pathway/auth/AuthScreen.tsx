'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RoadStep } from '@/types/pathway';
import { Button, Display, Logo } from '../ui/tropa';
import { HandNote } from '../primitives/Scribble';
import { MapScenery, ProgressRoad } from '../dashboard/ProgressRoad';

const ROAD: RoadStep[] = [{ id: 'a', title: 'Регистрация', status: 'current', meta: '30 секунд' }, { id: 'b', title: 'Профиль', status: 'locked' }, { id: 'c', title: 'Вузы', status: 'locked' }, { id: 'd', title: 'Экзамены', status: 'locked' }, { id: 'e', title: 'Заявки', status: 'locked' }];

/** Login / signup. Left: form card. Right (≥lg): the map with the first step «Регистрация» as «ты здесь». `mode` switches copy; wire `action` to your auth. */
export function AuthScreen({ mode = 'signup', error }: { mode?: 'login' | 'signup'; error?: string | null }) {
  const [show, setShow] = useState(false);
  const signup = mode === 'signup';
  return (
    <div className="min-h-dvh bg-background lg:grid lg:grid-cols-[minmax(0,560px)_minmax(0,1fr)]">
      <main className="flex min-h-dvh flex-col px-5 py-6 sm:px-10">
        <Logo />
        <div className="mx-auto my-auto w-full max-w-[420px] py-10">
          <div className="grid grid-cols-2 rounded-full bg-secondary p-1 text-[14px] font-bold" role="tablist">
            {(['login', 'signup'] as const).map((m) => <Link key={m} href={m === 'login' ? '/login' : '/signup'} role="tab" aria-selected={m === mode} className={cn('grid h-10 place-items-center rounded-full', m === mode ? 'bg-card shadow-chunky-soft' : 'text-muted-foreground')}>{m === 'login' ? 'Вход' : 'Регистрация'}</Link>)}
          </div>
          <Display as="h1" className="mt-7 text-[28px] font-bold leading-tight sm:text-[32px]">{signup ? 'Начнём твою тропу' : 'С возвращением!'}</Display>
          <p className="mt-2 text-[15.5px] font-medium text-ink-2">{signup ? 'Аккаунт бесплатный. Дальше — 10 вопросов о тебе.' : 'Продолжим с того места, где ты остановился.'}</p>
          <button type="button" className="press mt-6 flex h-12 w-full items-center justify-center gap-2.5 rounded-full bg-card text-[15px] font-bold shadow-chunky-soft ring-1 ring-input">
            <svg viewBox="0 0 24 24" className="size-5" aria-hidden><path fill="#4285F4" d="M23 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.2a5.3 5.3 0 0 1-2.3 3.5v2.9h3.7c2.2-2 3.4-5 3.4-8.5z" /><path fill="#34A853" d="M12 23.5c3.1 0 5.7-1 7.6-2.8l-3.7-2.9c-1 .7-2.3 1.1-3.9 1.1-3 0-5.5-2-6.4-4.7H1.8v3A11.5 11.5 0 0 0 12 23.5z" /><path fill="#FBBC05" d="M5.6 14.2a6.9 6.9 0 0 1 0-4.4v-3H1.8a11.5 11.5 0 0 0 0 10.4z" /><path fill="#EA4335" d="M12 4.9c1.7 0 3.2.6 4.4 1.7l3.3-3.3A11.5 11.5 0 0 0 1.8 6.8l3.8 3c.9-2.8 3.4-4.9 6.4-4.9z" /></svg>
            Продолжить с Google
          </button>
          <div className="my-5 flex items-center gap-3 text-[13px] font-semibold text-muted-foreground"><span className="h-px flex-1 bg-border" />или по почте<span className="h-px flex-1 bg-border" /></div>
          <form className="space-y-3" noValidate>
            {signup && <Input label="Имя" name="name" autoComplete="given-name" placeholder="Как к тебе обращаться" />}
            <Input label="Почта" name="email" type="email" autoComplete="email" placeholder="you@mail.kz" />
            <label className="block"><span className="text-[13.5px] font-bold">Пароль</span>
              <span className="relative mt-1.5 block"><input name="password" type={show ? 'text' : 'password'} autoComplete={signup ? 'new-password' : 'current-password'} placeholder="Минимум 8 символов" className="h-12 w-full rounded-[16px] bg-card pl-4 pr-12 text-[15px] ring-1 ring-input placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                <button type="button" onClick={() => setShow(!show)} aria-label={show ? 'Скрыть пароль' : 'Показать пароль'} className="absolute right-1 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full text-muted-foreground">{show ? <EyeOff className="size-5" aria-hidden /> : <Eye className="size-5" aria-hidden />}</button></span>
            </label>
            {error && <p role="alert" className="rounded-[14px] bg-danger-soft px-3 py-2 text-[14px] font-semibold text-destructive">{error}</p>}
            <Button type="submit" size="lg" className="mt-2 w-full" icon>{signup ? 'Создать аккаунт' : 'Войти'}</Button>
          </form>
          <p className="mt-4 text-center text-[12.5px] font-medium text-muted-foreground">{signup ? <>Нажимая «Создать аккаунт», ты соглашаешься с <Link href="/terms" className="font-bold text-primary underline-offset-2 hover:underline">условиями</Link> и <Link href="/privacy" className="font-bold text-primary underline-offset-2 hover:underline">политикой данных</Link>.</> : <Link href="/reset" className="font-bold text-primary">Забыли пароль?</Link>}</p>
        </div>
      </main>
      <aside className="relative hidden overflow-hidden lg:m-3 lg:block lg:rounded-[32px]" aria-hidden>
        <MapScenery />
        <div className="relative px-12 pt-14">
          <HandNote color="honey" className="text-[26px]">первый шаг — самый простой</HandNote>
          <p className="mt-3 max-w-[460px] font-display text-[30px] font-bold leading-[1.15] tracking-[-0.03em]">Вузы, экзамены и сроки — на одной тропе</p>
        </div>
        <ul className="relative mt-7 flex flex-wrap gap-2.5 px-12">
          {([['вузы', 'в каталоге', 'lg:-rotate-2'], ['10', 'вопросов о тебе', 'lg:rotate-2'], ['0 ₸', 'для школьников', 'lg:-rotate-1']] as const).map(([n, l, r]) => (
            <li key={l} className={`flex items-center gap-2.5 rounded-[18px] bg-card/95 py-2 pl-3 pr-4 shadow-[0_3px_0_var(--map-hill-1)] ring-1 ring-border ${r}`}><span className="font-display text-[22px] font-semibold">{n}</span><span className="max-w-[90px] text-[12px] font-bold leading-tight text-muted-foreground">{l}</span></li>
          ))}
        </ul>
        <ProgressRoad steps={ROAD} finish="Финиш · поступление" className="absolute inset-x-0 bottom-16" />
      </aside>
    </div>
  );
}
function Input({ label, ...p }: { label: string; name: string; type?: string; autoComplete?: string; placeholder?: string }) {
  return <label className="block"><span className="text-[13.5px] font-bold">{label}</span><input {...p} className="mt-1.5 h-12 w-full rounded-[16px] bg-card px-4 text-[15px] ring-1 ring-input placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring" /></label>;
}
