import { redirect } from "next/navigation";

import { SignOutButton } from "@/components/nav/sign-out-button";
import { getCurrentProfile } from "@/lib/profile/queries";
import { strings } from "@/lib/strings";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile } = await getCurrentProfile();

  if (profile.onboarding_completed) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/30 px-4 py-8">
      <header className="mx-auto mb-8 flex w-full max-w-lg items-center justify-between">
        <div className="text-lg font-semibold tracking-tight">{strings.app.name}</div>
        <SignOutButton userId={user.id} />
      </header>
      <main className="mx-auto w-full max-w-lg pb-12">{children}</main>
    </div>
  );
}
