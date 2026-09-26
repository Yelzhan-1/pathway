import Link from "next/link";

import { CheckStatusBadge } from "@/components/pathway/fit/CheckStatusBadge";
import { gapNextStep } from "@/lib/matching/gaps";
import type { FitResult } from "@/lib/matching/types";
import { strings } from "@/lib/strings";

export function FitBreakdown({ fit }: { fit: FitResult }) {
  return (
    <div className="space-y-4">
      <ul className="space-y-2">
        {fit.checks.map((check) => (
          <li
            key={check.key}
            className="rounded-[18px] bg-card p-3 ring-1 ring-border"
          >
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[14px] font-bold">{strings.universities.checks[check.key]}</p>
              <CheckStatusBadge status={check.status} />
            </div>
            <dl className="mt-2 grid gap-1 text-[13px] font-medium text-ink-2 sm:grid-cols-2">
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                  {strings.universities.have}
                </dt>
                <dd className="min-w-0 [overflow-wrap:anywhere]">{check.have ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                  {strings.universities.need}
                </dt>
                <dd className="min-w-0 [overflow-wrap:anywhere]">{check.need ?? "—"}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>
      <section>
        <h3 className="font-display text-[16px] font-semibold">{strings.universities.gapsTitle}</h3>
        {fit.gaps.length === 0 ? (
          <p className="mt-2 text-[14px] font-medium text-muted-foreground">{strings.universities.noGaps}</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {fit.gaps.map((gap) => {
              const step = gapNextStep(gap);
              return (
                <li key={`${gap.key}-${gap.message_ru}`} className="rounded-[18px] bg-honey-soft p-3">
                  <p className="text-[14px] font-bold">{gap.message_ru}</p>
                  {gap.delta ? <p className="mt-0.5 text-[13px] font-medium text-ink-2">{gap.delta}</p> : null}
                  <Link href={step.href} className="mt-2 inline-flex min-h-11 items-center text-[13px] font-bold text-primary">
                    {step.label_ru}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
