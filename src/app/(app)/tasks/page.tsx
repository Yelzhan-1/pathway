import type { Metadata } from "next";

import { SoonScreen } from "@/components/pathway/shell/SoonScreen";
import { strings } from "@/lib/strings";

export const metadata: Metadata = {
  title: `${strings.placeholders.tasks.title} — ${strings.app.name}`,
};

export default function TasksPage() {
  return (
    <SoonScreen
      title={strings.placeholders.tasks.title}
      detail={strings.placeholders.tasks.description}
    />
  );
}
