import { WidgetSkeleton } from "@/components/pathway/ui/tropa";
import { strings } from "@/lib/strings";

export function PageLoading() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true">
      <span className="sr-only" role="status">
        {strings.common.loading}
      </span>
      <WidgetSkeleton rows={2} />
      <WidgetSkeleton rows={4} />
      <WidgetSkeleton rows={3} />
    </div>
  );
}
