import type { Metadata } from "next";

import { PrepPlanList } from "@/components/pathway/exams/PrepPlanList";
import { Ring } from "@/components/pathway/primitives/Ring";
import { Compass } from "@/components/pathway/ui/illustrations";
import { EmptyCta, PageHeader } from "@/components/pathway/ui/tropa";
import { getPrepPlan } from "@/lib/data";
import { examReadiness } from "@/lib/progress/readiness";
import { strings } from "@/lib/strings";

export const metadata: Metadata = {
  title: `${strings.exams.title} — ${strings.app.name}`,
};

export default async function ExamsPage() {
  const { plan, error_ru } = await getPrepPlan();
  const readiness = examReadiness(plan);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={strings.exams.title}
        illustration={
          readiness != null ? (
            <Ring value={readiness} size={104} stroke={10} label={strings.exams.readiness} />
          ) : (
            <Compass className="w-full" />
          )
        }
      />
      {error_ru || !plan ? (
        <p role="alert" className="rounded-[20px] bg-danger-soft px-4 py-3 text-[14px] font-semibold text-destructive">
          {error_ru ?? strings.errorPage.description}
        </p>
      ) : plan.exams.length === 0 ? (
        <EmptyCta title={strings.exams.empty} cta={strings.exams.emptyCta} href="/universities" />
      ) : (
        <PrepPlanList exams={plan.exams} />
      )}
    </div>
  );
}
