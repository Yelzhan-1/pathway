import { redirect } from "next/navigation";

import { strings } from "@/lib/strings";
import { getCurrentProfile } from "@/lib/profile/queries";
import { signOutAction } from "@/lib/actions/sign-out";
import { Button } from "@/components/ui/button";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await getCurrentProfile();

  if (profile.onboarding_completed) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/30 px-4 py-8">
      <header className="mx-auto mb-8 flex w-full max-w-lg items-center justify-between">
        <div className="text-lg font-semibold tracking-tight">{strings.app.name}</div>
        <form action={signOutAction}>
          <Button type="submit" variant="ghost" size="sm">
            {strings.nav.signOut}
          </Button>
        </form>
      </header>
      <main className="mx-auto w-full max-w-lg pb-12">{children}</main>
    </div>
  );
}
