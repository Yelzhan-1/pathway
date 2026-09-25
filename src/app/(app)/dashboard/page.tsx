import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { strings } from "@/lib/strings";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: `${strings.nav.dashboard} — ${strings.app.name}`,
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // The (app) layout already guarantees `user` is set, but keep this page
  // self-contained in case it is ever rendered from elsewhere.
  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, onboarding_completed")
    .eq("id", user.id)
    .single();

  const displayName = profile?.full_name ?? user.email ?? "";

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">
        {strings.dashboard.greeting(displayName)}
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>
            {profile?.onboarding_completed
              ? strings.dashboard.onboardingDone
              : strings.dashboard.onboardingPending}
          </CardTitle>
        </CardHeader>
        {!profile?.onboarding_completed && (
          <CardContent>
            <Button render={<Link href="/onboarding" />}>
              {strings.dashboard.onboardingCta}
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
