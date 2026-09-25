import Link from "next/link";

import { Button } from "@/components/ui/button";
import { strings } from "@/lib/strings";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6">
        <span className="text-lg font-semibold tracking-tight">
          {strings.app.name}
        </span>
        <Button variant="ghost" nativeButton={false} render={<Link href="/login" />}>
          {strings.landing.ctaLogin}
        </Button>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center gap-8 px-6 py-16 text-center">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          {strings.landing.title}
        </h1>
        <p className="max-w-xl text-balance text-lg text-muted-foreground">
          {strings.landing.tagline}
        </p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button size="lg" nativeButton={false} render={<Link href="/signup" />}>
            {strings.landing.ctaStart}
          </Button>
          <Button
            size="lg"
            variant="outline"
            nativeButton={false}
            render={<Link href="/login" />}
          >
            {strings.landing.ctaLogin}
          </Button>
        </div>
      </main>

      <section className="mx-auto w-full max-w-5xl px-6 pb-20">
        <h2 className="mb-8 text-center text-xl font-semibold tracking-tight">
          {strings.landing.howItWorksTitle}
        </h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {strings.landing.steps.map((step, index) => (
            <div key={step.title} className="flex flex-col gap-2 rounded-xl border p-5">
              <span className="text-sm font-medium text-muted-foreground">
                {index + 1}
              </span>
              <h3 className="font-medium">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
