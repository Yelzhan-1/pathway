import Link from "next/link";

import { ShortlistControls } from "@/components/pathway/universities/ShortlistControls";
import { FitBadge } from "@/components/pathway/fit/FitBadge";
import { Flag } from "@/components/pathway/ui/Flag";
import { Display } from "@/components/pathway/ui/tropa";
import { UniMonogram } from "@/components/pathway/ui/UniMonogram";
import { toCountryCode } from "@/lib/dashboard/present";
import { initials } from "@/lib/format";
import type { FitCategory, FitResult, FitUniversity } from "@/lib/matching/types";
import { getCountryLabel } from "@/lib/profile/types";
import { strings } from "@/lib/strings";

const ORDER: FitCategory[] = ["dream", "target", "safety"];

type Item = {
  category: FitCategory;
  university: FitUniversity & { fit: FitResult };
};

export function ShortlistBoard({ items }: { items: Item[] }) {
  return (
    <div className="flex flex-col gap-6">
      {ORDER.map((category) => {
        const group = items.filter((item) => item.category === category);
        return (
          <section key={category} className="space-y-3">
            <Display as="h2" className="text-[18px]">
              {strings.favorites.groupHeading(strings.fit.category[category], group.length)}
            </Display>
            {group.length === 0 ? (
              <p className="text-[14px] font-medium text-muted-foreground">{strings.favorites.emptyGroup}</p>
            ) : (
              <ul className="grid gap-3">
                {group.map((item) => (
                  <li key={item.university.id} className="rounded-[var(--radius-card)] bg-card p-4 shadow-card ring-1 ring-border">
                    <div className="flex items-start gap-3">
                      <UniMonogram id={item.university.id} text={initials(item.university.name)} size={40} />
                      <div className="min-w-0 flex-1">
                        <Link href={`/universities/${item.university.slug}`} className="text-[15px] font-bold hover:underline">
                          {item.university.name}
                        </Link>
                        <p className="mt-1 flex items-center gap-1.5 text-[13px] font-semibold text-muted-foreground">
                          <Flag code={toCountryCode(item.university.country)} />
                          {getCountryLabel(item.university.country)}
                        </p>
                      </div>
                      <FitBadge
                        category={item.university.fit.suggestedCategory}
                        score={item.university.fit.score}
                        savedCategory={item.category}
                      />
                    </div>
                    <div className="mt-3">
                      <ShortlistControls universityId={item.university.id} current={item.category} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}
