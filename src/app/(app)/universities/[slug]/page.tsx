import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DeadlineList } from "@/components/pathway/universities/DeadlineList";
import { FitBreakdown } from "@/components/pathway/universities/FitBreakdown";
import { ShortlistControls } from "@/components/pathway/universities/ShortlistControls";
import { FitBadge } from "@/components/pathway/fit/FitBadge";
import { Flag } from "@/components/pathway/ui/Flag";
import { Display, TCard } from "@/components/pathway/ui/tropa";
import { UniMonogram } from "@/components/pathway/ui/UniMonogram";
import { getShortlist, getUniversity } from "@/lib/data";
import { toCountryCode } from "@/lib/dashboard/present";
import { initials } from "@/lib/format";
import { isGrantAid } from "@/lib/matching/budget";
import { toUtcDateString } from "@/lib/matching/dates";
import { aidLabel, formatMoneyUsd, publicNote } from "@/lib/labels/display";
import { getCountryLabel } from "@/lib/profile/types";
import { strings } from "@/lib/strings";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { item } = await getUniversity(slug);
  return {
    title: `${item?.name ?? strings.universities.title} — ${strings.app.name}`,
  };
}

export default async function UniversityDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const today = toUtcDateString(new Date());
  const [{ item, error_ru }, shortlist] = await Promise.all([getUniversity(slug), getShortlist()]);

  if (!item && !error_ru) notFound();
  if (!item) {
    return (
      <p role="alert" className="rounded-[20px] bg-danger-soft px-4 py-3 text-[14px] font-semibold text-destructive">
        {error_ru}
      </p>
    );
  }

  const saved = shortlist.items.find((row) => row.university.id === item.id)?.category ?? null;
  const place = [item.city, getCountryLabel(item.country)].filter(Boolean).join(", ");
  const tuition =
    item.tuition_usd_per_year == null
      ? strings.universities.tuitionUnknown
      : item.tuition_usd_per_year === 0
        ? strings.universities.freeTuition
        : `${formatMoneyUsd(item.tuition_usd_per_year)} ${strings.universities.perYear}`;
  const grant = aidLabel(item.aid_for_internationals);
  const tuitionNote = publicNote(item.tuition_note);
  const scholarshipsNote = publicNote(item.scholarships);
  const hasGrant = isGrantAid(item.aid_for_internationals) || item.tuition_usd_per_year === 0;

  return (
    <div className="flex flex-col gap-4">
      <TCard>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <UniMonogram id={item.id} text={initials(item.name)} size={56} />
          <div className="min-w-0 flex-1">
            <Display as="h1" className="text-[28px] font-bold sm:text-[32px]">
              {item.name}
            </Display>
            <p className="mt-1 flex items-center gap-1.5 text-[15px] font-semibold text-muted-foreground">
              <Flag code={toCountryCode(item.country)} />
              {place}
            </p>
          </div>
          <FitBadge category={item.fit.suggestedCategory} score={item.fit.score} savedCategory={saved} />
        </div>
        <div className="mt-4">
          <ShortlistControls universityId={item.id} current={saved} />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <a
            href={item.source_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center rounded-full bg-secondary px-4 text-[13px] font-bold"
          >
            {strings.universities.source}
          </a>
          {item.website_url ? (
            <a
              href={item.website_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center rounded-full bg-secondary px-4 text-[13px] font-bold"
            >
              {strings.universities.website}
            </a>
          ) : null}
        </div>
      </TCard>

      <TCard labelledBy="fit-h">
        <Display as="h2" id="fit-h" className="text-[18px]">
          {strings.universities.fitTitle}
        </Display>
        <div className="mt-3">
          <FitBreakdown fit={item.fit} />
        </div>
      </TCard>

      <TCard labelledBy="dl-h">
        <Display as="h2" id="dl-h" className="text-[18px]">
          {strings.universities.deadlinesTitle}
        </Display>
        <div className="mt-3">
          <DeadlineList university={item} today={today} />
        </div>
      </TCard>

      <TCard labelledBy="cost-h">
        <Display as="h2" id="cost-h" className="text-[18px]">
          {strings.universities.cost}
        </Display>
        <p className="mt-2 text-[16px] font-bold">{tuition}</p>
        {tuitionNote ? <p className="mt-1 text-[14px] font-medium text-ink-2">{tuitionNote}</p> : null}
        <p className="mt-3 text-[13px] font-bold text-muted-foreground">{strings.universities.grants}</p>
        <p className="text-[14px] font-semibold">{grant ?? (hasGrant ? strings.universities.freeTuition : "—")}</p>
        {scholarshipsNote ? <p className="mt-1 text-[14px] font-medium text-ink-2">{scholarshipsNote}</p> : null}
      </TCard>
    </div>
  );
}
