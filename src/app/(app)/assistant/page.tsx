import type { Metadata } from "next";

import { SoonScreen } from "@/components/pathway/shell/SoonScreen";
import { strings } from "@/lib/strings";

export const metadata: Metadata = {
  title: `AI-помощник — ${strings.app.name}`,
};

export default function AssistantPage() {
  return <SoonScreen title="AI-помощник" />;
}
