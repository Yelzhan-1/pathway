import type { Metadata } from "next";

import { SoonScreen } from "@/components/pathway/shell/SoonScreen";
import { strings } from "@/lib/strings";

export const metadata: Metadata = {
  title: `Экзамены — ${strings.app.name}`,
};

export default function ExamsPage() {
  return <SoonScreen title="Экзамены" />;
}
