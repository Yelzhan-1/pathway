import type { Metadata } from "next";

import { SoonScreen } from "@/components/pathway/shell/SoonScreen";
import { strings } from "@/lib/strings";

export const metadata: Metadata = {
  title: `Возможности — ${strings.app.name}`,
};

export default function OpportunitiesPage() {
  return <SoonScreen title="Возможности" />;
}
