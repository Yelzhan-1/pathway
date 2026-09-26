import type { Metadata } from "next";

import { Display, EmptyCta, TCard } from "@/components/pathway/ui/tropa";
import { getImpactStats } from "@/lib/data";
import { strings } from "@/lib/strings";

export const metadata: Metadata = {
  title: `${strings.impact.title} — ${strings.app.name}`,
};

export default async function ImpactPage() {
  const { stats, error_ru } = await getImpactStats();

  const tiles = stats
    ? [
        { label: strings.impact.users, value: stats.users },
        { label: strings.impact.onboarded, value: stats.onboarding_completed },
        { label: strings.impact.shortlist, value: stats.shortlisted_items },
        { label: strings.impact.roadmapDone, value: stats.roadmap_tasks_done },
        { label: strings.impact.cvs, value: stats.cvs_filled },
        { label: strings.impact.answers, value: stats.questions_answered },
      ]
    : [];

  const readiness = stats
    ? [
        { label: strings.impact.withGpa, value: stats.readiness_inputs.profiles_with_gpa },
        { label: strings.impact.withExams, value: stats.readiness_inputs.profiles_with_exams },
        { label: strings.impact.withShortlist, value: stats.readiness_inputs.profiles_with_shortlist },
        { label: strings.impact.withCv, value: stats.readiness_inputs.profiles_with_cv },
      ]
    : [];

  return (
    <div className="flex flex-col gap-4">
      <Display as="h1" className="text-[28px] font-bold sm:text-[32px]">
        {strings.impact.title}
      </Display>
      {error_ru || !stats ? (
        error_ru ? (
          <p role="alert" className="rounded-[20px] bg-danger-soft px-4 py-3 text-[14px] font-semibold text-destructive">
            {error_ru}
          </p>
        ) : (
          <EmptyCta title={strings.impact.empty} cta={strings.nav.dashboard} href="/dashboard" />
        )
      ) : (
        <>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {tiles.map((tile) => (
              <li key={tile.label}>
                <TCard>
                  <p className="text-[13px] font-bold text-muted-foreground">{tile.label}</p>
                  <p className="mt-1 font-display text-[28px] font-semibold">{tile.value}</p>
                </TCard>
              </li>
            ))}
          </ul>
          <TCard labelledBy="impact-readiness">
            <h2 id="impact-readiness" className="text-[16px] font-bold">
              {strings.impact.readiness}
            </h2>
            <ul className="mt-3 space-y-2">
              {readiness.map((row) => (
                <li key={row.label} className="flex items-center justify-between text-[14px] font-bold">
                  <span>{row.label}</span>
                  <span className="font-display text-[18px] font-semibold">{row.value}</span>
                </li>
              ))}
            </ul>
          </TCard>
          <TCard labelledBy="impact-feedback">
            <h2 id="impact-feedback" className="text-[16px] font-bold">
              {strings.impact.feedback}
            </h2>
            {stats.feedback_count ? (
              <>
                <p className="mt-2 font-display text-[28px] font-semibold">{stats.feedback_count}</p>
                <p className="mt-1 text-[14px] font-bold">
                  {strings.impact.feedbackAvg}:{" "}
                  {stats.feedback_avg == null ? "—" : Number(stats.feedback_avg).toFixed(1)}
                </p>
              </>
            ) : (
              <p className="mt-2 text-[14px] font-semibold text-ink-2">{strings.impact.feedbackNone}</p>
            )}
          </TCard>
        </>
      )}
    </div>
  );
}
