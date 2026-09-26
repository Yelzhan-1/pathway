import type { Metadata } from "next";

import Link from "next/link";

import { ProfileForm } from "@/components/profile/profile-form";
import { Avatar } from "@/components/pathway/shell/AppShell";
import { FreeOnlyToggle } from "@/components/pathway/shell/FreeOnlyToggle";
import { Ring } from "@/components/pathway/primitives/Ring";
import { Display } from "@/components/pathway/ui/tropa";
import { getSettings } from "@/lib/data";
import { computeProfileCompleteness } from "@/lib/profile/completeness";
import { getCatalogCountries, getCurrentProfile } from "@/lib/profile/queries";
import { profileSectionProgress } from "@/lib/profile/sections";
import { strings } from "@/lib/strings";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: `${strings.profile.title} — ${strings.app.name}`,
};

export default async function ProfilePage() {
  const { user, profile } = await getCurrentProfile();
  const [countries, settings] = await Promise.all([getCatalogCountries(), getSettings()]);
  const completeness = computeProfileCompleteness(profile);
  const sections = profileSectionProgress(completeness);
  const name = profile.full_name?.trim() || user.email || strings.profile.title;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <header className="flex flex-col gap-4 rounded-[var(--radius-card)] bg-card p-5 shadow-card ring-1 ring-border sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <Avatar name={name} size={80} />
          <Ring value={completeness.percent} size={64} stroke={8} />
        </div>
        <div className="min-w-0 flex-1">
          <Display as="h1" className="text-[30px] font-bold">
            {name}
          </Display>
          {profile.city ? <p className="mt-1 text-[15px] font-medium text-muted-foreground">{profile.city}</p> : null}
          <div className="mt-3">
            <FreeOnlyToggle freeOnly={settings.freeOnly} />
            <p className="mt-1.5 text-[13px] font-medium text-muted-foreground">{strings.preference.freeOnlyHint}</p>
          </div>
        </div>
      </header>
      <nav aria-label={strings.profile.title} className="flex flex-wrap gap-1.5">
        {sections.map((section) => (
          <Link
            key={section.id}
            href={section.href}
            className={cn(
              "inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-[13px] font-bold ring-1",
              section.done ? "bg-tone-mint-bg text-tone-mint-fg ring-transparent" : "bg-card text-foreground ring-border",
            )}
          >
            {section.title}
            <span className="text-[11px] opacity-80">{section.percent}%</span>
          </Link>
        ))}
      </nav>
      <ProfileForm profile={profile} countries={countries} />
    </div>
  );
}
