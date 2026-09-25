import type { Metadata } from "next";

import { ProfileForm } from "@/components/profile/profile-form";
import { getCatalogCountries, getCurrentProfile } from "@/lib/profile/queries";
import { strings } from "@/lib/strings";

export const metadata: Metadata = {
  title: `${strings.profile.title} — ${strings.app.name}`,
};

export default async function ProfilePage() {
  const { profile } = await getCurrentProfile();
  const countries = await getCatalogCountries();

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">{strings.profile.title}</h1>
      <ProfileForm profile={profile} countries={countries} />
    </div>
  );
}
