import { PenLine, Route, SlidersHorizontal, Sparkles } from "lucide-react";

import { strings } from "@/lib/strings";
import { cn } from "@/lib/utils";

const VISUAL = {
  whatif: {
    icon: SlidersHorizontal,
    tile: "bg-tone-honey-bg text-tone-honey-fg",
    frame: "lg:col-span-7 lg:-rotate-1 lg:origin-top-left",
  },
  assistant: {
    icon: Sparkles,
    tile: "bg-tone-sky-bg text-tone-sky-fg",
    frame: "lg:col-span-4 lg:col-start-9 lg:mt-16 lg:rotate-2",
  },
  path: {
    icon: Route,
    tile: "bg-tone-mint-bg text-tone-mint-fg",
    frame: "lg:col-span-4 lg:col-start-2 lg:mt-3",
  },
  essay: {
    icon: PenLine,
    tile: "bg-tone-dream-bg text-tone-dream-fg",
    frame: "lg:col-span-5 lg:col-start-7 lg:-mt-6 lg:rotate-1",
  },
} as const;

function WhatIfSketch() {
  return (
    <div className="mt-6 flex items-center gap-3">
      <div className="relative h-2 flex-1 rounded-full bg-secondary">
        <div className="absolute inset-y-0 left-0 w-[68%] rounded-full bg-primary" />
        <span className="absolute left-[68%] top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-card ring-2 ring-primary" />
      </div>
      <span className="rounded-full bg-tone-dream-bg px-2.5 py-1 text-[12px] font-extrabold text-tone-dream-fg">
        {strings.fit.category.dream}
      </span>
    </div>
  );
}

function AssistantSketch() {
  return (
    <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-[12px] font-bold text-ink-2">
      <span className="size-1.5 rounded-full bg-primary" />
      kaist.ac.kr
    </p>
  );
}

function PathSketch() {
  return (
    <div className="mt-5 flex items-center gap-2 text-primary" aria-hidden>
      <span className="size-2.5 rounded-full bg-primary" />
      <span className="h-px w-8 border-t-2 border-dashed border-primary/70" />
      <span className="size-2.5 rounded-full bg-honey" />
      <span className="h-px w-8 border-t-2 border-dashed border-primary/70" />
      <span className="size-2.5 rounded-full bg-tone-dream-fg" />
    </div>
  );
}

function EssaySketch() {
  return (
    <p className="mt-5 flex items-end gap-3">
      <span className="font-display text-[40px] font-bold leading-none text-primary">A−</span>
      <span className="mb-1 text-[13px] font-bold text-muted-foreground">3</span>
    </p>
  );
}

const SKETCH = {
  whatif: WhatIfSketch,
  assistant: AssistantSketch,
  path: PathSketch,
  essay: EssaySketch,
} as const;

export function CapabilityTiles() {
  return (
    <section className="mx-auto w-full max-w-[1240px] px-5 pb-24 pt-6 lg:px-10" aria-labelledby="can-do">
      <h2 id="can-do" className="max-w-md font-display text-[32px] font-bold leading-tight">
        {strings.landing.capabilitiesTitle}
      </h2>
      <div className="mt-12 grid gap-5 lg:grid-cols-12 lg:items-start">
        {strings.landing.capabilities.map((item) => {
          const visual = VISUAL[item.id];
          const Icon = visual.icon;
          const Sketch = SKETCH[item.id];
          return (
            <article
              key={item.id}
              className={cn(
                "rounded-[26px] bg-card p-6 shadow-card ring-1 ring-border lg:p-7",
                visual.frame,
              )}
            >
              <span className={cn("grid size-11 place-items-center rounded-[16px]", visual.tile)} aria-hidden>
                <Icon className="size-5" />
              </span>
              <h3 className="mt-4 font-display text-[20px] font-semibold">{item.title}</h3>
              <p className="mt-1 max-w-[28ch] text-[15px] font-medium leading-snug text-ink-2">{item.text}</p>
              <Sketch />
            </article>
          );
        })}
      </div>
    </section>
  );
}
