import { Display, TCard } from "@/components/pathway/ui/tropa";
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
          <dl className="mt-3 grid grid-cols-2 gap-3 text-[14px] sm:grid-cols-3">
            <div>
              <dt className="text-[12px] font-bold text-muted-foreground">{strings.exams.target}</dt>
              <dd className="font-extrabold">{exam.target}</dd>
            </div>
            <div>
              <dt className="text-[12px] font-bold text-muted-foreground">{strings.exams.current}</dt>
              <dd className="font-extrabold">{exam.current ?? strings.exams.noScore}</dd>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <dt className="text-[12px] font-bold text-muted-foreground">{strings.exams.plan}</dt>
              <dd className="font-extrabold">
                {exam.weeksUntilDeadline != null
                  ? strings.exams.weeks(exam.weeksUntilDeadline)
                  : strings.exams.noWeeks}
              </dd>
            </div>
          </dl>
          {exam.lastCycleWarning ? (
            <p className="mt-3 text-[13px] font-medium text-ink-2">{exam.lastCycleWarning}</p>
          ) : null}
          <ol className="mt-4 space-y-2">
            {exam.milestones.map((step) => (
              <li key={`${exam.code}-${step.week}`} className="rounded-[14px] bg-secondary px-3 py-2 text-[14px] font-semibold">
                {strings.exams.week(step.week)}: {step.title_ru}
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
