import { Target, TrendingUp, CalendarClock } from "lucide-react";

import { Collapsible } from "@/components/pathway/ui/Collapsible";
import { Display, StatChip, TCard } from "@/components/pathway/ui/tropa";
import { examLabel } from "@/lib/labels/display";
import type { PrepExamPlan } from "@/lib/prep/plan";
import { strings } from "@/lib/strings";

function examTitle(exam: PrepExamPlan): string {
  const label = examLabel(exam.code);
  if (label !== exam.code) return label;
  return exam.examName ?? label;
}

export function PrepPlanList({ exams }: { exams: PrepExamPlan[] }) {
  return (
    <div className="flex flex-col gap-4">
      {exams.map((exam) => (
        <TCard key={exam.code} labelledBy={`exam-${exam.code}`}>
          <Display as="h2" id={`exam-${exam.code}`} className="text-[20px]">
            {examTitle(exam)}
          </Display>
          <p className="mt-1 text-[13px] font-semibold text-muted-foreground">
            {strings.exams.forUniversity} {exam.targetUniversityName}
          </p>
          <p className="mt-3 flex flex-wrap gap-1.5">
            <StatChip icon={Target} label={strings.exams.target} value={String(exam.target)} tone="honey" />
            <StatChip
              icon={TrendingUp}
              label={strings.exams.current}
              value={exam.current != null ? String(exam.current) : strings.exams.noScore}
              tone="mint"
            />
            <StatChip
              icon={CalendarClock}
              value={exam.weeksUntilDeadline != null ? strings.exams.weeks(exam.weeksUntilDeadline) : strings.exams.noWeeks}
            />
          </p>
          {exam.lastCycleWarning ? (
            <Collapsible className="mt-3">
              <p>{exam.lastCycleWarning}</p>
            </Collapsible>
          ) : null}
          <ol className="mt-4 grid gap-2 sm:grid-cols-2">
            {exam.milestones.map((step) => (
              <li
                key={`${exam.code}-${step.week}`}
                className="flex items-start gap-2 rounded-[14px] bg-secondary px-3 py-2.5 text-[14px] font-semibold"
              >
                <span className="inline-flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full bg-card px-1.5 text-[11px] font-extrabold text-primary ring-1 ring-border">
                  {step.week}
                </span>
                <span className="min-w-0 leading-snug [overflow-wrap:anywhere]">{step.title_ru}</span>
              </li>
            ))}
          </ol>
          <div className="mt-3 flex flex-wrap gap-2">
            {exam.officialUrl ? (
              <a href={exam.officialUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center text-[13px] font-bold text-primary">
                {strings.exams.resources}
              </a>
            ) : null}
            {exam.sourceUrl ? (
              <a href={exam.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center text-[13px] font-bold text-primary">
                {strings.universities.source}
              </a>
            ) : null}
          </div>
        </TCard>
      ))}
    </div>
  );
}
