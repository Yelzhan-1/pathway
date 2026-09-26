import type { FitCategory } from "@/lib/matching/types";
import { strings } from "@/lib/strings";
import { cn } from "@/lib/utils";

const TONE: Record<FitCategory, string> = {
  dream: "bg-tone-dream-bg text-tone-dream-fg",
  target: "bg-tone-honey-bg text-tone-honey-fg",
  safety: "bg-tone-mint-bg text-tone-mint-fg",
};

export function FitBadge({
  category,
  score,
}: {
  category: FitCategory | null;
  score: number | null;
}) {
  if (!category && score == null) {
    return (
      <span className="inline-flex h-8 items-center rounded-full bg-secondary px-3 text-[12px] font-bold text-muted-foreground">
        {strings.universities.littleData}
      </span>
    );
  }
  return (
    <span
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[12px] font-extrabold",
        category ? TONE[category] : "bg-secondary text-secondary-foreground",
      )}
    >
      {category ? strings.fit.category[category] : null}
      {score != null ? (
        <span className={category ? "opacity-80" : undefined}>{strings.universities.score(score)}</span>
      ) : null}
    </span>
  );
}
