import type { Metadata } from "next";

import { strings } from "@/lib/strings";

export const metadata: Metadata = {
  title: `${strings.placeholders.onboarding.title} — ${strings.app.name}`,
};

export default function OnboardingPage() {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl font-semibold tracking-tight">
        {strings.placeholders.onboarding.title}
      </h1>
      <p className="text-muted-foreground">
        {strings.placeholders.onboarding.description}
      </p>
    </div>
  );
}
