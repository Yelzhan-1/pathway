import { TCard, WidgetHeader } from "@/components/pathway/ui/tropa";
import { strings } from "@/lib/strings";
import { cn } from "@/lib/utils";
import type { DashboardData } from "@/types/pathway";

export function ProgressPanel({ data }: { data: NonNullable<DashboardData["progress"]> }) {
  return (
    <TCard labelledBy="rd-h">
      <WidgetHeader
        id="rd-h"
        title={strings.dashboard.readiness}
        right={
          data.readinessPercent != null ? (
            <span className="font-display text-[18px] font-semibold">{data.readinessPercent}%</span>
          ) : (
            <span className="text-[12px] font-bold text-muted-foreground">{strings.dashboard.littleData}</span>
          )
        }
      />
      <ul className="mt-3 space-y-2">
        {data.parts.map((part) => (
          <li key={part.key} className="flex items-center justify-between gap-3 text-[13.5px] font-bold">
            <span>{part.label}</span>
            <span className="text-muted-foreground">
              {part.percent != null ? `${part.percent}%` : strings.dashboard.littleData}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[13px] font-semibold text-ink-2">
        {strings.dashboard.weeklySummary(data.weeklyGoal.due, data.weeklyGoal.done)}
      </p>
      <p className="mt-4 text-[12px] font-extrabold text-muted-foreground">{strings.dashboard.achievements}</p>
      <ul className="mt-2 flex flex-wrap gap-1.5">
        {data.achievements.map((item) => (
          <li
            key={item.id}
            className={cn(
              "rounded-full px-2.5 py-1 text-[11.5px] font-bold",
              item.unlocked ? "bg-tone-mint-bg text-tone-mint-fg" : "bg-secondary text-muted-foreground",
            )}
          >
            {item.title}
          </li>
        ))}
      </ul>
    </TCard>
  );
}
