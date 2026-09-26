import { redirect } from "next/navigation";

import { SignOutButton } from "@/components/nav/sign-out-button";
import { Logo } from "@/components/pathway/ui/tropa";
import { getCurrentProfile } from "@/lib/profile/queries";

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
    <div className="flex min-h-dvh flex-col bg-background px-4 py-6 sm:px-6">
      <header className="mx-auto mb-6 flex w-full max-w-5xl items-center justify-between">
        <Logo />
        <SignOutButton userId={user.id} />
      </header>
      <main className="mx-auto w-full max-w-5xl pb-16">{children}</main>
    </div>
  );
}
