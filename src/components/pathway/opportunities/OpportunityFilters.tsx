import { Button } from "@/components/pathway/ui/tropa";
import type { OpportunityType } from "@/lib/database.types";
import { strings } from "@/lib/strings";

const TYPES: OpportunityType[] = [
  "olympiad",
  "summer_program",
  "internship",
  "competition",
  "research",
  "scholarship",
  "course",
];
const FORMATS = ["online", "in_person", "hybrid"] as const;

export function OpportunityFilters({
  type,
  format,
  upcomingOnly,
  freeOnly,
}: {
  type: string;
  format: string;
  upcomingOnly: boolean;
  freeOnly: boolean;
}) {
  return (
    <form method="get" className="flex flex-col gap-3 rounded-[var(--radius-card)] bg-card p-4 shadow-card ring-1 ring-border">
      {freeOnly ? <p className="text-[13px] font-semibold text-ink-2">{strings.preference.freeOnlyHint}</p> : null}
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block text-[13px] font-bold">
          {strings.opportunities.type}
          <select name="type" defaultValue={type} className="mt-1 h-11 w-full rounded-full bg-background px-3 text-[14px] font-medium ring-1 ring-border">
            <option value="">{strings.universities.all}</option>
            {TYPES.map((value) => (
              <option key={value} value={value}>
                {strings.opportunities.types[value]}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-[13px] font-bold">
          {strings.opportunities.format}
          <select name="format" defaultValue={format} className="mt-1 h-11 w-full rounded-full bg-background px-3 text-[14px] font-medium ring-1 ring-border">
            <option value="">{strings.universities.all}</option>
            {FORMATS.map((value) => (
              <option key={value} value={value}>
                {strings.opportunities.formats[value]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex min-h-11 items-end gap-2 text-[13px] font-bold">
          <input type="checkbox" name="upcoming" value="1" defaultChecked={upcomingOnly} className="size-4 accent-primary" />
          {strings.opportunities.upcoming}
        </label>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" size="sm">
          {strings.opportunities.apply}
        </Button>
        <Button href="/opportunities" variant="soft" size="sm">
          {strings.opportunities.reset}
        </Button>
      </div>
    </form>
  );
}
