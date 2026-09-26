import type { FitCheckStatus } from "@/lib/matching/types";
import { strings } from "@/lib/strings";
import { cn } from "@/lib/utils";

const TONE: Record<FitCheckStatus, string> = {
  meets: "bg-tone-mint-bg text-tone-mint-fg",
  below: "bg-tone-honey-bg text-tone-honey-fg",
  unknown: "bg-secondary text-muted-foreground",
  not_required: "bg-secondary text-muted-foreground",
};

export function CheckStatusBadge({ status }: { status: FitCheckStatus }) {
  return (
    <span className={cn("inline-flex h-7 items-center rounded-full px-2.5 text-[12px] font-bold", TONE[status])}>
      {strings.fit.check[status]}
    </span>
  );
}
