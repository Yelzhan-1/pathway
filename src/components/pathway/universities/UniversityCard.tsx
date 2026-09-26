import Link from "next/link";
import { Gift, Languages, Wallet } from "lucide-react";

import { FitBadge } from "@/components/pathway/fit/FitBadge";
import { Flag } from "@/components/pathway/ui/Flag";
import { UniMonogram } from "@/components/pathway/ui/UniMonogram";
import { StatChip, TCard } from "@/components/pathway/ui/tropa";
import { toCountryCode } from "@/lib/dashboard/present";
import { initials } from "@/lib/format";
import { uniqueDisplayMajors } from "@/lib/matching/synonyms";
import type { FitCategory } from "@/lib/matching/types";
import { getCountryLabel } from "@/lib/profile/types";
import type { UniversityWithFit } from "@/lib/data/load";
import { universityKeyFacts, type KeyFactIcon } from "@/lib/universities/keyFacts";

import { ShortlistControls } from "./ShortlistControls";

const KEY_FACT_ICON: Record<KeyFactIcon, typeof Wallet> = { price: Wallet, grant: Gift, ielts: Languages };

export function UniversityCard({
  university,
  savedCategory,
}: {
  university: UniversityWithFit;
  savedCategory: FitCategory | null;
}) {
  const place = [university.city, getCountryLabel(university.country)].filter(Boolean).join(", ");
  const majors = uniqueDisplayMajors((university.majors ?? []).filter(Boolean)).slice(0, 3);
  const keyFacts = universityKeyFacts(university);

  return (
    <TCard as="article" className="flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <UniMonogram id={university.id} text={initials(university.name)} size={44} />
        <div className="min-w-0 flex-1">
          <Link href={`/universities/${university.slug}`} className="text-[16px] font-bold leading-tight hover:underline">
            {university.name}
          </Link>
          <p className="mt-1 flex items-center gap-1.5 text-[13px] font-semibold text-muted-foreground">
            <Flag code={toCountryCode(university.country)} />
            {place}
          </p>
        </div>
        <FitBadge
          category={university.fit.suggestedCategory}
          score={university.fit.score}
          savedCategory={savedCategory}
        />
      </div>
      {keyFacts.length > 0 ? (
        <p className="flex flex-wrap gap-1.5">
          {keyFacts.map((fact) => (
            <StatChip key={fact.icon} icon={KEY_FACT_ICON[fact.icon]} value={fact.value} tone="mint" />
          ))}
        </p>
      ) : null}
      {majors.length > 0 ? (
        <p className="flex flex-wrap gap-1">
          {majors.map((major) => (
            <span key={major} className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-bold text-ink-2">
              {major}
            </span>
          ))}
        </p>
      ) : null}
      <ShortlistControls universityId={university.id} current={savedCategory} />
    </TCard>
  );
}
