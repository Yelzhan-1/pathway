// src/app/credits/page.tsx — REQUIRED for CC BY-SA photos (visible attribution). Link it from the footer («Фото и лицензии»).
import { Display, TCard } from '@/components/pathway/ui/tropa';

const CREDITS = [
  { file: 'campus/nazarbayev-*.webp', what: 'Атриум Назарбаев Университета, Астана', author: 'Dinononozavr1', src: 'https://commons.wikimedia.org/wiki/File:Nazarbayev_University_2.jpg', lic: 'CC BY-SA 4.0', licUrl: 'https://creativecommons.org/licenses/by-sa/4.0' },
  { file: 'campus/kaist-*.webp', what: 'Кампус KAIST, Тэджон', author: 'AhmadElq', src: 'https://commons.wikimedia.org/wiki/File:KAIST_fountains_view.jpg', lic: 'CC BY-SA 4.0', licUrl: 'https://creativecommons.org/licenses/by-sa/4.0' },
  { file: 'campus/tu-delft-*.webp', what: 'Библиотека TU Delft', author: 'Nol Aders', src: 'https://commons.wikimedia.org/wiki/File:TU-Delft-Bibl-1.jpg', lic: 'CC BY-SA 3.0', licUrl: 'https://creativecommons.org/licenses/by-sa/3.0' },
];

export default function CreditsPage() {
  return (
    <main className="mx-auto max-w-[860px] px-5 py-12">
      <Display as="h1" className="text-[30px] font-bold">Фото и лицензии</Display>
      <p className="mt-2 text-[15.5px] text-ink-2">Фотографии вузов — с Wikimedia Commons. Изображения уменьшены и обрезаны, распространяются на тех же условиях. Иллюстрации (карта, холмы, указатель) и значки вузов нарисованы нами; логотипы вузов не используются.</p>
      <TCard className="mt-6"><ul className="divide-y divide-border">
        {CREDITS.map((c) => (
          <li key={c.file} className="py-3 text-[14.5px]"><b>{c.what}</b> — {c.author}, <a className="text-primary underline" href={c.src}>Wikimedia Commons</a>, <a className="text-primary underline" href={c.licUrl}>{c.lic}</a></li>
        ))}
      </ul></TCard>
      <p className="mt-4 text-[13.5px] text-muted-foreground">Шрифты Onest, Unbounded, Caveat — SIL Open Font License 1.1. Иконки — Lucide (ISC).</p>
    </main>
  );
}
