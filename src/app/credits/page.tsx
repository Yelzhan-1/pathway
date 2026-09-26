import type { Metadata } from "next";
import Link from "next/link";

import { Display, Logo, TCard } from "@/components/pathway/ui/tropa";
import { strings } from "@/lib/strings";

const CREDITS = [
  {
    file: "campus/nazarbayev-*.webp",
    what: "Атриум Назарбаев Университета, Астана",
    author: "Dinononozavr1",
    src: "https://commons.wikimedia.org/wiki/File:Nazarbayev_University_2.jpg",
    lic: "CC BY-SA 4.0",
    licUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  {
    file: "campus/kaist-*.webp",
    what: "Кампус KAIST, Тэджон",
    author: "AhmadElq",
    src: "https://commons.wikimedia.org/wiki/File:KAIST_fountains_view.jpg",
    lic: "CC BY-SA 4.0",
    licUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  {
    file: "campus/tu-delft-*.webp",
    what: "Библиотека TU Delft",
    author: "Nol Aders",
    src: "https://commons.wikimedia.org/wiki/File:TU-Delft-Bibl-1.jpg",
    lic: "CC BY-SA 3.0",
    licUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
];

export const metadata: Metadata = {
  title: `${strings.credits.link} — ${strings.app.name}`,
};

export default function CreditsPage() {
  return (
    <main className="mx-auto max-w-[860px] px-5 py-12">
      <Link href="/" aria-label="pathway — на главную">
        <Logo />
      </Link>
      <Display as="h1" className="mt-8 text-[30px] font-bold">
        {strings.credits.link}
      </Display>
      <p className="mt-2 text-[15.5px] text-ink-2">
        Фотографии вузов — с Wikimedia Commons. Изображения уменьшены и обрезаны, распространяются на тех же условиях.
        Иллюстрации (карта, холмы, указатель) и значки вузов нарисованы нами; логотипы вузов не используются.
      </p>
      <TCard className="mt-6">
        <ul className="divide-y divide-border">
          {CREDITS.map((credit) => (
            <li key={credit.file} className="py-3 text-[14.5px]">
              <b>{credit.what}</b> — {credit.author},{" "}
              <a className="text-primary underline" href={credit.src}>
                Wikimedia Commons
              </a>
              ,{" "}
              <a className="text-primary underline" href={credit.licUrl}>
                {credit.lic}
              </a>
            </li>
          ))}
        </ul>
      </TCard>
      <p className="mt-4 text-[13.5px] text-muted-foreground">
        Шрифты Onest, Unbounded, Caveat — SIL Open Font License 1.1. Иконки — Lucide (ISC).
      </p>
    </main>
  );
}
