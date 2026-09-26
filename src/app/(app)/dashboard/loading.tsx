import { Skeleton, WidgetSkeleton } from "@/components/pathway/ui/tropa";

export default function Loading() {
  return (
    <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_340px]" aria-busy="true">
      <div className="flex flex-col gap-4">
        <Skeleton className="aspect-[16/9] w-full rounded-[var(--radius-hero)] max-lg:aspect-auto max-lg:h-[520px]" />
        <div className="grid gap-4 lg:grid-cols-[1.25fr_1fr]">
          <WidgetSkeleton />
          <WidgetSkeleton />
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <WidgetSkeleton />
          <WidgetSkeleton />
          <WidgetSkeleton />
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <WidgetSkeleton rows={4} />
        <WidgetSkeleton rows={1} />
        <WidgetSkeleton rows={2} />
        <WidgetSkeleton rows={2} />
      </div>
    </div>
  );
}
