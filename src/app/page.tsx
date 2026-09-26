import Link from "next/link";

import { Photo } from "@/components/pathway/primitives/Photo";
import { Display, Logo } from "@/components/pathway/ui/tropa";
import { Button } from "@/components/ui/button";
import { plural } from "@/lib/format";
import { strings } from "@/lib/strings";
import { createClient } from "@/lib/supabase/server";

const CAMPUS = {
  src: "/images/campus/nazarbayev-720.webp",
  width: 720,
  height: 450,
  alt: "Атриум Назарбаев Университета, Астана",
  credit: "Dinononozavr1 · Wikimedia Commons · CC BY-SA 4.0",
};

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { count, error } = await supabase
    .from("universities")
    .select("id", { count: "exact", head: true });
  const catalogCount = error ? null : count;

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
          {catalogCount != null ? (
            <p className="mt-3 text-[15px] font-bold text-primary">
              В каталоге {catalogCount} {plural(catalogCount, "вуз", "вуза", "вузов")}
            </p>
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
        <figure>
          <Photo img={CAMPUS} sizes="(min-width: 1024px) 520px, 100vw" eager className="aspect-[16/10] w-full" rounded="rounded-[var(--radius-hero)]" />
          <figcaption className="mt-2 text-[13px] font-medium text-muted-foreground">
            Фото: {CAMPUS.credit}
          </figcaption>
        </figure>
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
