import type { Metadata } from "next";

import { GuideScreen } from "@/components/pathway/guide/GuideScreen";
import { strings } from "@/lib/strings";

export const metadata: Metadata = {
  title: `${strings.guide.title} — ${strings.app.name}`,
};

export default function GuidePage() {
  return <GuideScreen />;
}
