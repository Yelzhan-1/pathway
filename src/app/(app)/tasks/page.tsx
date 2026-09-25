import type { Metadata } from "next";

import { strings } from "@/lib/strings";

export const metadata: Metadata = {
  title: `${strings.placeholders.tasks.title} — ${strings.app.name}`,
};

export default function TasksPage() {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl font-semibold tracking-tight">
        {strings.placeholders.tasks.title}
      </h1>
      <p className="text-muted-foreground">
        {strings.placeholders.tasks.description}
      </p>
    </div>
  );
}
