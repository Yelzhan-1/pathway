import type { Metadata } from "next";

import { strings } from "@/lib/strings";

export const metadata: Metadata = {
  title: `${strings.placeholders.profile.title} — ${strings.app.name}`,
};

export default function ProfilePage() {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl font-semibold tracking-tight">
        {strings.placeholders.profile.title}
      </h1>
      <p className="text-muted-foreground">
        {strings.placeholders.profile.description}
      </p>
    </div>
  );
}
