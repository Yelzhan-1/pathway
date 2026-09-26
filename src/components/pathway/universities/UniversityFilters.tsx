import { Button } from "@/components/pathway/ui/tropa";
import { strings } from "@/lib/strings";
import { UNIVERSITY_REGIONS } from "@/lib/universities/search";
import { getCountryLabel } from "@/lib/profile/types";

export function UniversityFilters({
  q,
  region,
  country,
  major,
  deadline,
  countries,
  freeOnly,
}: {
  q: string;
  region: string;
  country: string;
  major: string;
  deadline: string;
  countries: string[];
  freeOnly: boolean;
}) {
  return (
    <form className="flex flex-col gap-3 rounded-[var(--radius-card)] bg-card p-4 shadow-card ring-1 ring-border" method="get">
      {freeOnly ? (
        <p className="text-[13px] font-semibold text-ink-2">{strings.preference.freeOnlyHint}</p>
      ) : null}
      <label className="block text-[13px] font-bold">
        {strings.universities.search}
        <input
          name="q"
          type="search"
          defaultValue={q}
          className="mt-1 h-11 w-full rounded-full bg-background px-4 text-[14px] font-medium ring-1 ring-border focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </label>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="block text-[13px] font-bold">
          {strings.universities.region}
          <select
            name="region"
            defaultValue={region}
            className="mt-1 h-11 w-full rounded-full bg-background px-3 text-[14px] font-medium ring-1 ring-border"
          >
            <option value="">{strings.universities.all}</option>
            {UNIVERSITY_REGIONS.map((value) => (
              <option key={value} value={value}>
                {strings.universities.regions[value]}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-[13px] font-bold">
          {strings.universities.country}
          <select
            name="country"
            defaultValue={country}
            className="mt-1 h-11 w-full rounded-full bg-background px-3 text-[14px] font-medium ring-1 ring-border"
          >
            <option value="">{strings.universities.all}</option>
            {countries.map((value) => (
              <option key={value} value={value}>
                {getCountryLabel(value)}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-[13px] font-bold">
          {strings.universities.field}
          <input
            name="major"
            type="search"
            defaultValue={major}
            className="mt-1 h-11 w-full rounded-full bg-background px-4 text-[14px] font-medium ring-1 ring-border focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>
        <label className="block text-[13px] font-bold">
          {strings.universities.deadline}
          <select
            name="deadline"
            defaultValue={deadline}
            className="mt-1 h-11 w-full rounded-full bg-background px-3 text-[14px] font-medium ring-1 ring-border"
          >
            <option value="">{strings.universities.all}</option>
            <option value="upcoming">{strings.universities.upcoming}</option>
            <option value="last_cycle">{strings.universities.lastCycle}</option>
          </select>
        </label>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" size="sm">
          {strings.universities.apply}
        </Button>
        <Button href="/universities" variant="soft" size="sm">
          {strings.universities.reset}
        </Button>
      </div>
    </form>
  );
}
