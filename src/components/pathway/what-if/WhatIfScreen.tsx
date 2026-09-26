"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { FitBadge } from "@/components/pathway/fit/FitBadge";
import { Display, TCard } from "@/components/pathway/ui/tropa";
import { isFreeOrGrantUniversity } from "@/lib/matching/budget";
import { fitUniversity } from "@/lib/matching/fit";
import { SCORED_FIT_KEYS, type FitCategory, type FitProfile, type FitUniversity } from "@/lib/matching/types";
import { hypotheticalProfile, SLIDER_EXAMS } from "@/lib/matching/what-if";
import { examLabel } from "@/lib/labels/display";
import { EXAM_RANGES } from "@/lib/profile/exam-ranges";
import { strings } from "@/lib/strings";
import { cn } from "@/lib/utils";

export type WhatIfRow = {
  id: string;
  name: string;
  slug: string;
  group: "shortlist" | "catalog";
  university: FitUniversity;
};

function taken(profile: FitProfile, code: string): number | null {
  const scores = profile.exams
    .filter((exam) => exam.code === code && exam.status === "taken" && typeof exam.score === "number")
    .map((exam) => exam.score as number);
  return scores.length ? Math.max(...scores) : null;
}

function grantReady(profile: FitProfile, university: FitUniversity, today: string): boolean {
  if (!isFreeOrGrantUniversity(university)) return false;
  const fit = fitUniversity(profile, university, today);
  return !fit.checks.some(
    (check) => (SCORED_FIT_KEYS as readonly string[]).includes(check.key) && check.status === "below",
  );
}

function rank(category: FitCategory | null): number {
  if (category === "dream") return 0;
  if (category === "target") return 1;
  if (category === "safety") return 2;
  return -1;
}

export function WhatIfScreen({
  profile,
  rows,
  today,
}: {
  profile: FitProfile;
  rows: WhatIfRow[];
  today: string;
}) {
  const [gpa, setGpa] = useState<number | null>(profile.gpa);
  const [scores, setScores] = useState<Record<string, number | null>>(() =>
    Object.fromEntries(SLIDER_EXAMS.map((code) => [code, taken(profile, code)])),
  );

  const hypothetical: FitProfile = useMemo(
    () => hypotheticalProfile(profile, { gpa, scores }),
    [gpa, profile, scores],
  );

  const compared = useMemo(() => {
    return rows.map((row) => {
      const before = fitUniversity(profile, row.university, today);
      const after = fitUniversity(hypothetical, row.university, today);
      const readyBefore = grantReady(profile, row.university, today);
      const readyAfter = grantReady(hypothetical, row.university, today);
      return {
        ...row,
        before: before.suggestedCategory,
        after: after.suggestedCategory,
        improved: rank(after.suggestedCategory) > rank(before.suggestedCategory),
        grantUnlocked: readyAfter && !readyBefore,
      };
    });
  }, [hypothetical, profile, rows, today]);

  const improved = compared.filter((row) => row.improved).length;
  const dropped = compared.filter(
    (row) => row.before !== row.after && rank(row.after) < rank(row.before),
  ).length;
  const grants = compared.filter((row) => row.grantUnlocked).length;
  const summary = [
    improved > 0 ? strings.whatIf.improved(improved) : null,
    dropped > 0 ? strings.whatIf.dropped(dropped) : null,
    grants > 0 ? strings.whatIf.grants(grants) : null,
  ].filter((part): part is string => part != null);

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div className="min-w-0">
        <Display as="h1" className="text-[28px] font-bold sm:text-[32px]">
          {strings.whatIf.title}
        </Display>
        <p className="mt-2 text-[14px] font-medium leading-snug text-ink-2">{strings.whatIf.hint}</p>
      </div>

      <TCard labelledBy="what-if-controls" className="min-w-0">
        <Display as="h2" id="what-if-controls" className="text-[16px]">
          {strings.whatIf.title}
        </Display>
        <div className="mt-3 grid min-w-0 gap-4">
          {SLIDER_EXAMS.map((code) => {
            const range = EXAM_RANGES[code];
            const step = range.step ?? (code === "SAT" ? 10 : 1);
            const value = scores[code];
            return (
              <label key={code} className="min-w-0 block">
                <span className="flex items-center justify-between gap-2 text-[13px] font-bold">
                  {examLabel(code)}
                  <span className="text-muted-foreground">{value ?? "—"}</span>
                </span>
                <input
                  type="range"
                  min={range.min}
                  max={range.max}
                  step={step}
                  value={value ?? range.min}
                  aria-label={examLabel(code)}
                  onChange={(event) =>
                    setScores((current) => ({ ...current, [code]: Number(event.target.value) }))
                  }
                  className="mt-2 w-full min-w-0 max-w-full accent-[var(--primary)]"
                />
              </label>
            );
          })}
          {profile.gpa_scale != null ? (
            <label className="min-w-0 block">
              <span className="flex items-center justify-between gap-2 text-[13px] font-bold">
                {strings.whatIf.gpa} ({strings.whatIf.scale} {profile.gpa_scale})
                <span className="text-muted-foreground">{gpa ?? "—"}</span>
              </span>
              <input
                type="range"
                min={0}
                max={profile.gpa_scale}
                step={0.1}
                value={gpa ?? 0}
                aria-label={strings.whatIf.gpa}
                onChange={(event) => setGpa(Number(event.target.value))}
                className="mt-2 w-full min-w-0 max-w-full accent-[var(--primary)]"
              />
            </label>
          ) : null}
        </div>
      </TCard>

      <p className="text-[14px] font-bold">
        {summary.length === 0 ? strings.whatIf.none : summary.join(". ")}
      </p>

      {(["shortlist", "catalog"] as const).map((group) => {
        const items = compared.filter((row) => row.group === group);
        if (items.length === 0) return null;
        return (
          <section key={group} className="min-w-0">
            <h2 className="text-[14px] font-extrabold text-ink-2">
              {group === "shortlist" ? strings.whatIf.shortlist : strings.whatIf.catalog}
            </h2>
            <ul className="mt-2 grid w-full min-w-0 max-w-full gap-2">
              {items.map((row) => (
                <li key={row.id} className="min-w-0 w-full max-w-full">
                  <Link
                    href={`/universities/${row.slug}`}
                    className={cn(
                      "flex w-full min-w-0 max-w-full flex-wrap items-start justify-between gap-2 rounded-[18px] bg-card p-3 ring-1 ring-border",
                      row.improved && "ring-2 ring-primary",
                    )}
                  >
                    <span className="min-w-0 flex-1 basis-0">
                      <span className="block break-words text-[14px] font-bold [overflow-wrap:anywhere]">
                        {row.name}
                      </span>
                      {row.before !== row.after ? (
                        <span className="mt-0.5 block break-words text-[12px] font-bold text-primary">
                          {strings.whatIf.fromTo(
                            row.before ? strings.fit.category[row.before] : strings.universities.littleData,
                            row.after ? strings.fit.category[row.after] : strings.universities.littleData,
                          )}
                        </span>
                      ) : null}
                    </span>
                    <span className="max-w-full shrink-0">
                      <FitBadge category={row.after} score={null} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
