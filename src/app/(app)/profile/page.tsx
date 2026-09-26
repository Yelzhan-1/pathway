import type { Metadata } from "next";

import { ProfileForm } from "@/components/profile/profile-form";
import { Avatar } from "@/components/pathway/shell/AppShell";
import { Display } from "@/components/pathway/ui/tropa";
import { computeProfileCompleteness } from "@/lib/profile/completeness";
import { getCatalogCountries, getCurrentProfile } from "@/lib/profile/queries";
import { strings } from "@/lib/strings";

export const metadata: Metadata = {
  title: `${strings.profile.title} — ${strings.app.name}`,
};

export default async function ProfilePage() {
  const { user, profile } = await getCurrentProfile();
  const countries = await getCatalogCountries();
  const completeness = computeProfileCompleteness(profile);
  const name = profile.full_name?.trim() || user.email || strings.profile.title;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <header className="flex items-center gap-4 rounded-[var(--radius-card)] bg-card p-5 shadow-card ring-1 ring-border">
        <Avatar name={name} size={96} />
        <div className="min-w-0">
          <Display as="h1" className="text-[30px] font-bold">
            {name}
          </Display>
          {profile.city ? <p className="mt-1 text-[15px] font-medium text-muted-foreground">{profile.city}</p> : null}
          <p className="mt-2 text-[14px] font-bold text-primary">
            {strings.dashboard.completenessTitle(completeness.percent)}
          </p>
        </div>
      </header>
      <ProfileForm profile={profile} countries={countries} />
    </div>
  );
}
