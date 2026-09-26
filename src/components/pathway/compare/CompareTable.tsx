import Link from "next/link";

import { CheckStatusBadge } from "@/components/pathway/fit/CheckStatusBadge";
import { FitBadge } from "@/components/pathway/fit/FitBadge";
import { classifyDeadlines, LAST_CYCLE_WARNING_RU } from "@/lib/matching/deadlines";
import { aidLabel, formatMoneyUsd, roundLabel } from "@/lib/labels/display";
import { FIT_CHECK_KEYS, type FitCategory, type FitResult, type FitUniversity } from "@/lib/matching/types";
import { getCountryLabel } from "@/lib/profile/types";
import { strings } from "@/lib/strings";
import { cn } from "@/lib/utils";

type CompareUni = FitUniversity & { fit: FitResult };

type CompareItem = {
  category: FitCategory;
  university: CompareUni;
};

function nextDeadline(university: CompareUni, today: string): string {
  const classified = classifyDeadlines(university.deadlines, today);
  if (classified.upcoming[0]) return `${roundLabel(classified.upcoming[0].round)}: ${classified.upcoming[0].date}`;
  if (classified.lastCycle[0]) {
    return `${roundLabel(classified.lastCycle[0].round)}: ${classified.lastCycle[0].date} · ${LAST_CYCLE_WARNING_RU}`;
  }
  return "—";
}

function cost(university: CompareUni): string {
  if (university.tuition_usd_per_year == null) return strings.universities.tuitionUnknown;
  if (university.tuition_usd_per_year === 0) return strings.universities.freeTuition;
  return formatMoneyUsd(university.tuition_usd_per_year);
}

function grants(university: CompareUni): string {
  if (university.tuition_usd_per_year === 0) return strings.universities.freeTuition;
  return aidLabel(university.aid_for_internationals) ?? "—";
}

/** True when the compared universities differ on this metric — used to highlight the row. */
function differs(values: string[]): boolean {
  return values.some((value) => value !== values[0]);
}

const DIFF_ROW = "bg-honey-soft/60";

export function CompareTable({ items, today }: { items: CompareItem[]; today: string }) {
  const categoryValues = items.map((item) => strings.fit.category[item.category]);
  const countryValues = items.map((item) => getCountryLabel(item.university.country));
  const deadlineValues = items.map((item) => nextDeadline(item.university, today));
  const costValues = items.map((item) => cost(item.university));
  const grantValues = items.map((item) => grants(item.university));

  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[640px] border-separate border-spacing-0 text-left text-[13px]">
          <thead>
            <tr>
              <th className="sticky left-0 bg-background p-3 font-bold">{strings.compare.metric}</th>
              {items.map((item) => (
                <th key={item.university.id} className="p-3 align-bottom">
                  <Link href={`/universities/${item.university.slug}`} className="font-bold hover:underline">
                    {item.university.name}
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className={cn("odd:bg-card", differs(categoryValues) && DIFF_ROW)}>
              <th className="sticky left-0 bg-inherit p-3 font-bold">{strings.compare.list}</th>
              {items.map((item) => (
                <td key={item.university.id} className="p-3 font-semibold">
                  {strings.fit.category[item.category]}
                </td>
              ))}
            </tr>
            <tr>
              <th className="sticky left-0 bg-background p-3 font-bold">{strings.universities.fitTitle}</th>
              {items.map((item) => (
                <td key={item.university.id} className="p-3">
                  <FitBadge
                    category={item.university.fit.suggestedCategory}
                    score={item.university.fit.score}
                    savedCategory={item.category}
                  />
                </td>
              ))}
            </tr>
            <tr className={cn("odd:bg-card", differs(countryValues) && DIFF_ROW)}>
              <th className="sticky left-0 bg-inherit p-3 font-bold">{strings.universities.country}</th>
              {items.map((item) => (
                <td key={item.university.id} className="p-3 font-semibold">
                  {getCountryLabel(item.university.country)}
                </td>
              ))}
            </tr>
            {FIT_CHECK_KEYS.filter((key) => key !== "country" && key !== "deadline").map((key) => (
              <tr key={key} className="odd:bg-card">
                <th className="sticky left-0 bg-inherit p-3 font-bold">{strings.universities.checks[key]}</th>
                {items.map((item) => {
                  const check = item.university.fit.checks.find((row) => row.key === key);
                  return (
                    <td key={item.university.id} className="p-3">
                      {check ? (
                        <div className="space-y-1">
                          <CheckStatusBadge status={check.status} />
                          <p className="font-medium text-ink-2">
                            {check.have ?? "—"} / {check.need ?? "—"}
                          </p>
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
            <tr className={cn(differs(deadlineValues) && DIFF_ROW)}>
              <th className="sticky left-0 bg-background p-3 font-bold">{strings.universities.deadlinesTitle}</th>
              {items.map((item) => (
                <td key={item.university.id} className="p-3 font-semibold">
                  {nextDeadline(item.university, today)}
                </td>
              ))}
            </tr>
            <tr className={cn("odd:bg-card", differs(costValues) && DIFF_ROW)}>
              <th className="sticky left-0 bg-inherit p-3 font-bold">{strings.universities.cost}</th>
              {items.map((item) => (
                <td key={item.university.id} className="p-3 font-semibold">
                  {cost(item.university)}
                </td>
              ))}
            </tr>
            <tr className={cn(differs(grantValues) && DIFF_ROW)}>
              <th className="sticky left-0 bg-background p-3 font-bold">{strings.universities.grants}</th>
              {items.map((item) => (
                <td key={item.university.id} className="p-3 font-semibold">
                  {grants(item.university)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <ul className="grid gap-3 md:hidden">
        {items.map((item) => (
          <li key={item.university.id} className="rounded-[var(--radius-card)] bg-card p-4 shadow-card ring-1 ring-border">
            <Link href={`/universities/${item.university.slug}`} className="text-[16px] font-bold hover:underline">
              {item.university.name}
            </Link>
            <p className="mt-1 text-[13px] font-semibold text-muted-foreground">
              {strings.fit.category[item.category]} · {getCountryLabel(item.university.country)}
            </p>
            <div className="mt-2">
              <FitBadge
                category={item.university.fit.suggestedCategory}
                score={item.university.fit.score}
                savedCategory={item.category}
              />
            </div>
            <dl className="mt-3 space-y-2 text-[13px]">
              {FIT_CHECK_KEYS.filter((key) => key !== "country" && key !== "deadline").map((key) => {
                const check = item.university.fit.checks.find((row) => row.key === key);
                return (
                  <div key={key}>
                    <dt className="font-bold">{strings.universities.checks[key]}</dt>
                    <dd className="mt-1 flex flex-wrap items-center gap-2">
                      {check ? <CheckStatusBadge status={check.status} /> : null}
                      <span>{check ? `${check.have ?? "—"} / ${check.need ?? "—"}` : "—"}</span>
                    </dd>
                  </div>
                );
              })}
              <div>
                <dt className="font-bold">{strings.universities.deadlinesTitle}</dt>
                <dd>{nextDeadline(item.university, today)}</dd>
              </div>
              <div>
                <dt className="font-bold">{strings.universities.cost}</dt>
                <dd>{cost(item.university)}</dd>
              </div>
              <div>
                <dt className="font-bold">{strings.universities.grants}</dt>
                <dd>{grants(item.university)}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>
    </>
  );
}
