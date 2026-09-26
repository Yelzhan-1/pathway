import { FitBadge } from "@/components/pathway/fit/FitBadge";
import { Collapsible } from "@/components/pathway/ui/Collapsible";
import { Display, TCard } from "@/components/pathway/ui/tropa";
import type { ShortestPathResult } from "@/lib/matching/path";
import { strings } from "@/lib/strings";

import { AddPathPlanButton } from "./AddPathPlanButton";

export function ShortestPathCard({
  universityId,
  path,
}: {
  universityId: string;
  path: ShortestPathResult;
}) {
  const best = path.combos[0] ?? null;
  const rest = path.combos.slice(1);

  return (
    <TCard labelledBy="path-h" className="min-w-0">
      <Display as="h2" id="path-h" className="text-[18px]">
        {strings.universities.pathTitle}
      </Display>
      {best ? (
        <div className="mt-3 min-w-0 space-y-3">
          <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
            <p className="text-[14px] font-bold">
              {strings.universities.pathWeeks(best.weeks)}
            </p>
            <FitBadge category={best.category} score={best.score} />
          </div>
          <ul className="space-y-1.5">
            {best.levers.map((lever) => (
              <li key={lever.id} className="min-w-0 text-[14px] font-semibold leading-snug [overflow-wrap:anywhere]">
                {lever.label_ru}
              </li>
            ))}
          </ul>
          <AddPathPlanButton universityId={universityId} comboIndex={0} />
          {rest.length > 0 ? (
            <div className="border-t border-border pt-3">
              <Collapsible label={strings.universities.pathAlt}>
                <ul className="space-y-3">
                  {rest.map((combo, index) => (
                    <li key={combo.levers.map((item) => item.id).join("|")} className="min-w-0">
                      <p className="text-[13px] font-bold text-foreground">
                        {strings.universities.pathWeeks(combo.weeks)}
                      </p>
                      <p className="mt-1 text-[13px] font-medium leading-snug text-ink-2 [overflow-wrap:anywhere]">
                        {combo.levers.map((item) => item.label_ru).join(" · ")}
                      </p>
                      <div className="mt-2">
                        <AddPathPlanButton universityId={universityId} comboIndex={index + 1} />
                      </div>
                    </li>
                  ))}
                </ul>
              </Collapsible>
            </div>
          ) : null}
        </div>
      ) : (
        <p className="mt-3 text-[14px] font-medium leading-snug text-ink-2">
          {path.reason_ru ?? strings.universities.pathEmpty}
        </p>
      )}
    </TCard>
  );
}
