import type { Metadata } from "next";

import { ShortlistBoard } from "@/components/pathway/favorites/ShortlistBoard";
import { Backpack } from "@/components/pathway/ui/illustrations";
import { EmptyCta, PageHeader } from "@/components/pathway/ui/tropa";
import { getShortlist } from "@/lib/data";
import { plural } from "@/lib/format";
import { strings } from "@/lib/strings";

export const metadata: Metadata = {
  title: `${strings.favorites.title} — ${strings.app.name}`,
};

export default async function FavoritesPage() {
  const { items, error_ru } = await getShortlist();

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={strings.favorites.title}
        subtitle={strings.favorites.count(items.length, plural(items.length, "вуз", "вуза", "вузов"))}
        illustration={<Backpack className="w-full" />}
        action={items.length >= 2 ? { label: strings.favorites.toCompare, href: "/compare" } : undefined}
      />
      {error_ru ? (
        <p role="alert" className="rounded-[20px] bg-danger-soft px-4 py-3 text-[14px] font-semibold text-destructive">
          {error_ru}
        </p>
      ) : items.length === 0 ? (
        <EmptyCta title={strings.favorites.empty} cta={strings.favorites.emptyCta} href="/universities" />
      ) : (
        <ShortlistBoard
          items={items.map((item) => ({
            category: item.category,
            university: { ...item.university, fit: item.fit },
          }))}
        />
      )}
    </div>
  );
}
