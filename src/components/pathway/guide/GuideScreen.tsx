import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Display, TCard } from "@/components/pathway/ui/tropa";
import { strings } from "@/lib/strings";

export function GuideScreen() {
  return (
    <div className="mx-auto flex w-full min-w-0 max-w-2xl flex-col gap-4">
      <TCard>
        <Display as="h1" className="text-[28px] font-bold sm:text-[32px]">
          {strings.guide.title}
        </Display>
        <p className="mt-2 text-[15px] font-medium leading-snug text-ink-2">{strings.guide.intro}</p>
      </TCard>
      <ol className="flex flex-col gap-3">
        {strings.guide.steps.map((step, index) => (
          <li key={step.href + step.title}>
            <TCard as="article" className="min-w-0">
              <Link href={step.href} className="flex min-w-0 items-start gap-3">
                <span
                  aria-hidden
                  className="grid size-10 shrink-0 place-items-center rounded-[14px] bg-tone-mint-bg font-display text-[16px] font-bold text-tone-mint-fg"
                >
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="font-display text-[17px] font-semibold">{step.title}</span>
                    <ArrowRight className="size-4 shrink-0 text-primary" aria-hidden />
                  </span>
                  <span className="mt-1 block text-[14px] font-medium leading-snug text-ink-2 [overflow-wrap:anywhere]">
                    {step.text}
                  </span>
                </span>
              </Link>
            </TCard>
          </li>
        ))}
      </ol>
    </div>
  );
}
