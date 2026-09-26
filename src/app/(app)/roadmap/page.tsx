import type { Metadata } from "next";

import { RoadmapBoard } from "@/components/pathway/roadmap/RoadmapBoard";
import { SyncRoadmapButton } from "@/components/pathway/roadmap/SyncRoadmapButton";
import { CalendarMark } from "@/components/pathway/ui/illustrations";
import { EmptyCta, PageHeader } from "@/components/pathway/ui/tropa";
import { getRoadmap } from "@/lib/data";
import { strings } from "@/lib/strings";

export const metadata: Metadata = {
  title: `${strings.roadmap.title} — ${strings.app.name}`,
};

export default async function RoadmapPage() {
  const { tasks, error_ru } = await getRoadmap();

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title={strings.roadmap.title} illustration={<CalendarMark className="w-full" />} />
      <div className="flex justify-end">
        <SyncRoadmapButton />
      </div>
      {error_ru ? (
        <p role="alert" className="rounded-[20px] bg-danger-soft px-4 py-3 text-[14px] font-semibold text-destructive">
          {error_ru}
        </p>
      ) : tasks.length === 0 ? (
        <EmptyCta title={strings.roadmap.empty} cta={strings.roadmap.emptyCta} href="/universities" />
      ) : (
        <RoadmapBoard tasks={tasks} />
      )}
    </div>
  );
}
