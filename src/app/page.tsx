import Link from "next/link";

import { CapabilityTiles } from "@/components/pathway/landing/CapabilityTiles";
import { HeroStack } from "@/components/pathway/landing/HeroStack";
import { Display, Logo } from "@/components/pathway/ui/tropa";
import { Button } from "@/components/ui/button";
import { plural } from "@/lib/format";
import { strings } from "@/lib/strings";
import { createClient } from "@/lib/supabase/server";

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const [universityCount, countryRows, opportunityCount] = await Promise.all([
    supabase.from("universities").select("id", { count: "exact", head: true }),
    supabase.from("universities").select("country"),
    supabase.from("opportunities").select("id", { count: "exact", head: true }),
  ]);
  const catalogCount = universityCount.error ? null : universityCount.count;
  const countryCount = countryRows.error
    ? null
    : new Set((countryRows.data ?? []).map((row) => row.country).filter((country) => country.trim().length > 0)).size;
  const grantCount = opportunityCount.error ? null : opportunityCount.count;
  const stats = [
    catalogCount == null
      ? null
      : { value: catalogCount, label: plural(catalogCount, ...strings.landing.statUniversity) },
    countryCount == null
      ? null
      : { value: countryCount, label: plural(countryCount, ...strings.landing.statCountry) },
    grantCount == null ? null : { value: grantCount, label: strings.landing.statOpportunity },
  ].filter((stat) => stat != null);

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="mx-auto flex h-[72px] w-full max-w-[1240px] items-center justify-between px-5 lg:px-10">
        <Logo />
        {user ? (
          <Button nativeButton={false} render={<Link href="/dashboard" />}>
            {strings.landing.ctaDashboard}
          </Button>
        ) : (
          <Button variant="ghost" nativeButton={false} render={<Link href="/login" />}>
            {strings.landing.ctaLogin}
          </Button>
        )}
      </header>

      <main className="mx-auto grid w-full max-w-[1240px] flex-1 items-center gap-10 px-5 py-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)] lg:px-10">
        <div>
          <Display as="h1" className="text-[40px] font-bold leading-[1.05] sm:text-[52px]">
            {strings.landing.title}
          </Display>
          <p className="mt-5 max-w-xl text-[18px] font-medium text-ink-2">{strings.landing.tagline}</p>
          {stats.length > 0 ? (
            <ul className="mt-8 flex flex-wrap gap-x-10 gap-y-4">
              {stats.map((stat) => (
                <li key={stat.label}>
                  <p className="font-display text-[32px] font-bold leading-none text-primary">{stat.value}</p>
                  <p className="mt-1.5 text-[13px] font-bold text-ink-2">{stat.label}</p>
                </li>
              ))}
            </ul>
          ) : null}
          {user ? (
            <Button className="mt-7" size="lg" nativeButton={false} render={<Link href="/dashboard" />}>
              {strings.landing.ctaDashboard}
            </Button>
          ) : (
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" nativeButton={false} render={<Link href="/signup" />}>
                {strings.landing.ctaStart}
              </Button>
              <Button size="lg" variant="outline" nativeButton={false} render={<Link href="/login" />}>
                {strings.landing.ctaLogin}
              </Button>
            </div>
          )}
        </div>
        <HeroStack />
      </main>

      <section className="mx-auto w-full max-w-[1240px] px-5 pb-16 lg:px-10">
        <h2 className="mb-8 text-center font-display text-[28px] font-bold">{strings.landing.howItWorksTitle}</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {strings.landing.steps.map((step, index) => (
            <div key={step.title} className="flex flex-col gap-2 rounded-[var(--radius-card)] bg-card p-5 shadow-card ring-1 ring-border">
              <span className="font-display text-[20px] font-bold text-primary">{index + 1}</span>
              <h3 className="font-display text-[18px] font-semibold">{step.title}</h3>
              <p className="text-[15px] font-medium text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      <CapabilityTiles />

      <footer className="mt-auto border-t border-border px-5 py-6">
        <div className="mx-auto flex w-full max-w-[1240px] items-center justify-between gap-4">
          <Logo />
          <Link href="/credits" className="inline-flex min-h-11 items-center text-[14px] font-bold text-primary underline-offset-2 hover:underline">
            {strings.credits.link}
          </Link>
        </div>
      </footer>
    </div>
  );
}
