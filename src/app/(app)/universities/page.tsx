import type { Metadata } from "next";

import { UniversityCard } from "@/components/pathway/universities/UniversityCard";
import { UniversityFilters } from "@/components/pathway/universities/UniversityFilters";
import { Display, EmptyCta } from "@/components/pathway/ui/tropa";
import { getSettings, getShortlist, getUniversities } from "@/lib/data";
import { toUtcDateString } from "@/lib/matching/dates";
import type { FitCategory } from "@/lib/matching/types";
import { getCatalogCountries } from "@/lib/profile/queries";
import { strings } from "@/lib/strings";
import { firstParam, matchesDeadlineFilter, parseUniversityQuery } from "@/lib/universities/search";

export const metadata: Metadata = {
  title: `${strings.universities.title} — ${strings.app.name}`,
};

export default async function UniversitiesPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string | string[];
    region?: string | string[];
    country?: string | string[];
    major?: string | string[];
    deadline?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const parsed = parseUniversityQuery(params);
  const today = toUtcDateString(new Date());

  const [list, shortlist, countries, settings] = await Promise.all([
    getUniversities(parsed.filters),
    getShortlist(),
    getCatalogCountries(),
    getSettings(),
  ]);

  const saved = new Map<string, FitCategory>(
    shortlist.items.map((item) => [item.university.id, item.category]),
  );
  const items = parsed.deadline
    ? list.items.filter((item) => matchesDeadlineFilter(item.deadlines, today, parsed.deadline!))
    : list.items;

  return (
    <div className="flex flex-col gap-4">
      <Display as="h1" className="text-[28px] font-bold sm:text-[32px]">
        {strings.universities.title}
      </Display>
      <UniversityFilters
        q={firstParam(params.q)}
        region={firstParam(params.region)}
        country={firstParam(params.country)}
        major={firstParam(params.major)}
        deadline={firstParam(params.deadline)}
        countries={countries}
        freeOnly={settings.freeOnly}
      />
      {list.error_ru ? (
        <p role="alert" className="rounded-[20px] bg-danger-soft px-4 py-3 text-[14px] font-semibold text-destructive">
          {list.error_ru}
        </p>
      ) : items.length === 0 ? (
        <EmptyCta
          title={strings.universities.empty}
          cta={strings.universities.emptyCta}
          href="/universities"
        />
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {items.map((university) => (
            <li key={university.id}>
              <UniversityCard university={university} savedCategory={saved.get(university.id) ?? null} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
