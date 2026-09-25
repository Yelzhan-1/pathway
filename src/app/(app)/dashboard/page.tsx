import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { computeProfileCompleteness } from "@/lib/profile/completeness";
import { getCurrentProfile } from "@/lib/profile/queries";
import { strings } from "@/lib/strings";

export const metadata: Metadata = {
  title: `${strings.nav.dashboard} — ${strings.app.name}`,
};

export default async function DashboardPage() {
  const { user, profile } = await getCurrentProfile();
  const displayName = profile.full_name ?? user.email ?? "";
  const completeness = computeProfileCompleteness(profile);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">
        {strings.dashboard.greeting(displayName)}
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>{strings.dashboard.completenessTitle(completeness.percent)}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {completeness.firstMissing ? (
            <Button nativeButton={false} render={<Link href={completeness.firstMissing.href} />}>
              {strings.dashboard.completenessCta}
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground">
              {strings.dashboard.completenessDone}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {profile.onboarding_completed
              ? strings.dashboard.onboardingDone
              : strings.dashboard.onboardingPending}
          </CardTitle>
        </CardHeader>
        {!profile.onboarding_completed && (
          <CardContent>
            <Button nativeButton={false} render={<Link href="/onboarding" />}>
              {strings.dashboard.onboardingCta}
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
