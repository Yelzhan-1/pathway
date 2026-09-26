import type { Metadata } from "next";

import { EssayScreen } from "@/components/pathway/essay/EssayScreen";
import { getUniversityCatalogList } from "@/lib/data";
import { strings } from "@/lib/strings";

export const metadata: Metadata = {
  title: `${strings.essay.title} — ${strings.app.name}`,
};

export default async function EssayPage() {
  const { items } = await getUniversityCatalogList();

  return <EssayScreen universities={items} />;
}
