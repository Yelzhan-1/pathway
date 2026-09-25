import type { Metadata } from "next";

import { strings } from "@/lib/strings";

export const metadata: Metadata = {
  title: `${strings.placeholders.universities.title} — ${strings.app.name}`,
};

export default function UniversitiesPage() {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl font-semibold tracking-tight">
        {strings.placeholders.universities.title}
      </h1>
      <p className="text-muted-foreground">
        {strings.placeholders.universities.description}
      </p>
    </div>
  );
}
