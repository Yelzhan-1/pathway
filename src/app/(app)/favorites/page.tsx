import type { Metadata } from "next";

import { ShortlistBoard } from "@/components/pathway/favorites/ShortlistBoard";
import { Button, Display, EmptyCta } from "@/components/pathway/ui/tropa";
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
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Display as="h1" className="text-[28px] font-bold sm:text-[32px]">
            {strings.favorites.title}
          </Display>
          <p className="mt-1 text-[14px] font-semibold text-muted-foreground">
            {strings.favorites.count(items.length, plural(items.length, "вуз", "вуза", "вузов"))}
          </p>
        </div>
        {items.length >= 2 ? (
          <Button href="/compare" size="sm">
            {strings.favorites.toCompare}
          </Button>
        ) : null}
      </div>
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
