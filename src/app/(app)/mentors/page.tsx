import type { Metadata } from "next";

import { SoonScreen } from "@/components/pathway/shell/SoonScreen";
import { strings } from "@/lib/strings";

export const metadata: Metadata = {
  title: `${strings.nav.mentors} — ${strings.app.name}`,
};

export default function MentorsPage() {
  return <SoonScreen title={strings.nav.mentors} />;
}
