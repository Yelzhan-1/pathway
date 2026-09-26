import type { Metadata } from "next";

import { SoonScreen } from "@/components/pathway/shell/SoonScreen";
import { strings } from "@/lib/strings";

export const metadata: Metadata = {
  title: `${strings.placeholders.roadmap.title} — ${strings.app.name}`,
};

export default function RoadmapPage() {
  return (
    <SoonScreen
      title={strings.placeholders.roadmap.title}
      detail={strings.placeholders.roadmap.description}
    />
  );
}
