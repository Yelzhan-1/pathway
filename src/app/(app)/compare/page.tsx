import type { Metadata } from "next";

import { CompareLive } from "@/components/pathway/compare/CompareLive";
import { Signpost } from "@/components/pathway/ui/illustrations";
import { EmptyCta, PageHeader } from "@/components/pathway/ui/tropa";
import { getShortlist } from "@/lib/data";
import { toUtcDateString } from "@/lib/matching/dates";
import { strings } from "@/lib/strings";

export const metadata: Metadata = {
  title: `${strings.compare.title} — ${strings.app.name}`,
};

function selectedIds(value: string | string[] | undefined): string[] {
  if (Array.isArray(value)) return value.flatMap((item) => item.split(",")).map((item) => item.trim()).filter(Boolean);
  if (typeof value === "string") return value.split(",").map((item) => item.trim()).filter(Boolean);
  return [];
}

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string | string[] }>;
}) {
  const params = await searchParams;
  const today = toUtcDateString(new Date());
  const { items, error_ru } = await getShortlist();
  const wanted = selectedIds(params.ids);
  const picked = (wanted.length > 0 ? wanted : items.slice(0, 2).map((item) => item.university.id))
    .map((id) => items.find((item) => item.university.id === id))
    .filter((item): item is (typeof items)[number] => Boolean(item))
    .slice(0, 4);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title={strings.compare.title} subtitle={strings.compare.pick} illustration={<Signpost className="w-full" />} />
      {error_ru ? (
        <p role="alert" className="rounded-[20px] bg-danger-soft px-4 py-3 text-[14px] font-semibold text-destructive">
          {error_ru}
        </p>
      ) : items.length < 2 ? (
        <EmptyCta title={strings.compare.needTwo} cta={strings.favorites.emptyCta} href="/universities" />
      ) : (
        <>
          <CompareLive
            options={items.map((item) => ({ id: item.university.id, name: item.university.name }))}
            initialIds={picked.map((item) => item.university.id)}
            items={items.map((item) => ({
              category: item.category,
              university: { ...item.university, fit: item.fit },
            }))}
            today={today}
          />
        </>
      )}
    </div>
  );
}
