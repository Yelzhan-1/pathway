import type { Metadata } from "next";

import { SoonScreen } from "@/components/pathway/shell/SoonScreen";
import { strings } from "@/lib/strings";

export const metadata: Metadata = {
  title: `${strings.placeholders.universities.title} — ${strings.app.name}`,
};

export default async function UniversitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim() : "";

  return (
    <SoonScreen
      title={strings.placeholders.universities.title}
      detail={query ? `Поиск: ${query}. ${strings.soon.body}` : strings.placeholders.universities.description}
    />
  );
}
