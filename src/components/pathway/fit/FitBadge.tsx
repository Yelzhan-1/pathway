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
  savedCategory = null,
}: {
  category: FitCategory | null;
  score: number | null;
  savedCategory?: FitCategory | null;
}) {
  const shown = savedCategory ?? category;
  if (!shown && score == null) {
    return (
      <span className="inline-flex h-8 items-center rounded-full bg-secondary px-3 text-[12px] font-bold text-muted-foreground">
        {strings.universities.littleData}
      </span>
    );
  }
  const hint =
    savedCategory && category && savedCategory !== category
      ? `${strings.universities.hintCategory}: ${strings.fit.category[category]}`
      : null;
  return (
    <span className="inline-flex min-w-0 flex-col items-end gap-0.5">
      <span
        className={cn(
          "inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[12px] font-extrabold",
          shown ? TONE[shown] : "bg-secondary text-secondary-foreground",
        )}
      >
        {shown ? strings.fit.category[shown] : null}
        {score != null ? (
          <span className={shown ? "opacity-80" : undefined}>{strings.universities.score(score)}</span>
        ) : null}
      </span>
      {hint ? <span className="max-w-[11rem] text-right text-[11px] font-semibold leading-tight text-muted-foreground">{hint}</span> : null}
    </span>
  );
}
