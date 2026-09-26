import type { Metadata } from "next";

import { RoadmapBoard } from "@/components/pathway/roadmap/RoadmapBoard";
import { SyncRoadmapButton } from "@/components/pathway/roadmap/SyncRoadmapButton";
import { Display, EmptyCta } from "@/components/pathway/ui/tropa";
import { getRoadmap } from "@/lib/data";
import { strings } from "@/lib/strings";

export const metadata: Metadata = {
  title: `${strings.roadmap.title} — ${strings.app.name}`,
};

export default async function RoadmapPage() {
  const { tasks, error_ru } = await getRoadmap();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Display as="h1" className="text-[28px] font-bold sm:text-[32px]">
          {strings.roadmap.title}
        </Display>
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
