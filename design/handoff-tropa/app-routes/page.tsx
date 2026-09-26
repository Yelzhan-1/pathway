// src/app/page.tsx — landing hero.
import { LandingHero } from '@/components/pathway/landing/LandingHero';
import type { LandingData } from '@/types/pathway';

const landing: LandingData = {
  kicker: 'без паники, по шагам',
  title: ['Твоя тропа', 'к поступлению'],
  lead: 'Ответь на 10 вопросов — и Pathway проложит маршрут: вузы, экзамены, документы и сроки. Шаг за шагом, без хаоса в голове.',
  cta: 'Начать бесплатно', secondary: 'Как это работает',
  bullets: ['35 вузов в каталоге', 'План за 3 минуты', 'Бесплатно для школьников'], // keep «35» in sync with the universities table count
  photo: { src: '/images/campus/nazarbayev-720.webp', width: 720, height: 450, alt: 'Атриум Назарбаев Университета, Астана', credit: 'Dinononozavr1 · Wikimedia Commons · CC BY-SA 4.0' },
};
export default function Home() { return <LandingHero data={landing} />; }
