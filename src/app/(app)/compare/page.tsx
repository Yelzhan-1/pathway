import type { Metadata } from "next";

import { SoonScreen } from "@/components/pathway/shell/SoonScreen";
import { strings } from "@/lib/strings";

export const metadata: Metadata = {
  title: `Сравнение — ${strings.app.name}`,
};

export default function ComparePage() {
  return <SoonScreen title="Сравнение" />;
}
