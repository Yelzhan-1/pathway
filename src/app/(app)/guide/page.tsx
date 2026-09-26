import type { Metadata } from "next";

import { SoonScreen } from "@/components/pathway/shell/SoonScreen";
import { strings } from "@/lib/strings";

export const metadata: Metadata = {
  title: `С чего начать — ${strings.app.name}`,
};

export default function GuidePage() {
  return <SoonScreen title="С чего начать?" />;
}
