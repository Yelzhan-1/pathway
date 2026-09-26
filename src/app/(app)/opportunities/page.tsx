import type { Metadata } from "next";

import { OpportunityFilters } from "@/components/pathway/opportunities/OpportunityFilters";
import { OpportunityList } from "@/components/pathway/opportunities/OpportunityList";
import { Compass } from "@/components/pathway/ui/illustrations";
import { EmptyCta, PageHeader } from "@/components/pathway/ui/tropa";
import { getOpportunities, getSettings } from "@/lib/data";
import type { OpportunityType } from "@/lib/database.types";
import { toUtcDateString } from "@/lib/matching/dates";
import { getCurrentProfile } from "@/lib/profile/queries";
import { strings } from "@/lib/strings";
import { firstParam } from "@/lib/universities/search";

export const metadata: Metadata = {
  title: `${strings.opportunities.title} — ${strings.app.name}`,
};

const TYPES: OpportunityType[] = [
  "olympiad",
  "summer_program",
  "internship",
  "competition",
  "research",
  "scholarship",
  "course",
];

export default async function OpportunitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string | string[]; format?: string | string[]; upcoming?: string | string[] }>;
}) {
  const params = await searchParams;
  const type = firstParam(params.type);
  const format = firstParam(params.format);
  const upcomingOnly = firstParam(params.upcoming) === "1";
  const today = toUtcDateString(new Date());

  const [{ profile }, settings, list] = await Promise.all([
    getCurrentProfile(),
    getSettings(),
    getOpportunities({
      type: TYPES.includes(type as OpportunityType) ? type : undefined,
      format: format || undefined,
      upcomingOnly: upcomingOnly || undefined,
    }),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title={strings.opportunities.title} illustration={<Compass className="w-full" />} />
      <OpportunityFilters type={type} format={format} upcomingOnly={upcomingOnly} freeOnly={settings.freeOnly} />
      {list.error_ru ? (
        <p role="alert" className="rounded-[20px] bg-danger-soft px-4 py-3 text-[14px] font-semibold text-destructive">
          {list.error_ru}
        </p>
      ) : list.items.length === 0 ? (
        <EmptyCta title={strings.opportunities.empty} cta={strings.opportunities.emptyCta} href="/profile" />
      ) : (
        <OpportunityList
          items={list.items}
          profile={{ grade_or_year: profile.grade_or_year, path: profile.path }}
          today={today}
        />
      )}
    </div>
  );
}
