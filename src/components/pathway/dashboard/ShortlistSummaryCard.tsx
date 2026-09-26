import Link from "next/link";
import { ArrowRight, Heart } from "lucide-react";
import type { ChancesSummary } from "@/types/pathway";
import { strings } from "@/lib/strings";
import { EmptyCta, TCard, WidgetHeader } from "../ui/tropa";

/** «Твой список»: one line — «Мечта N · Цель N · Запасной N →». Plain numbers, no count-up (no 0/0/0 flash). */
export function ShortlistSummaryCard({ data }: { data: ChancesSummary | null }) {
  const total = data ? data.dream + data.target + data.safety : 0;
  return (
    <TCard labelledBy="shortlist-h" className="min-w-0">
      <WidgetHeader id="shortlist-h" title={strings.dashboard.shortlistTitle} />
      {!data || !total ? (
        <EmptyCta
          art={
            <span className="grid size-11 place-items-center rounded-[14px] bg-tone-coral-bg text-tone-coral-fg" aria-hidden>
              <Heart className="size-6" />
            </span>
          }
          title={strings.dashboard.shortlistEmpty}
          cta={strings.dashboard.shortlistCta}
          href="/universities"
        />
      ) : (
        <Link
          href={data.href}
          className="mt-3 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-[15px] font-bold"
          aria-label={`${strings.fit.category.dream} ${data.dream}, ${strings.fit.category.target} ${data.target}, ${strings.fit.category.safety} ${data.safety}`}
        >
          <span>{strings.fit.category.dream} {data.dream}</span>
          <span aria-hidden className="text-muted-foreground">·</span>
          <span>{strings.fit.category.target} {data.target}</span>
          <span aria-hidden className="text-muted-foreground">·</span>
          <span>{strings.fit.category.safety} {data.safety}</span>
          <ArrowRight className="ml-auto size-4 shrink-0" aria-hidden />
        </Link>
      )}
    </TCard>
  );
}
