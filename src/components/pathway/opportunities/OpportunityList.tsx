import {
  Award,
  BookOpen,
  Briefcase,
  CalendarClock,
  FlaskConical,
  GraduationCap,
  Sun,
  Trophy,
  type LucideIcon,
} from "lucide-react";

import { StatChip, TCard } from "@/components/pathway/ui/tropa";
import type { Database, OpportunityType } from "@/lib/database.types";
import { opportunityReasons, type OpportunityProfile } from "@/lib/opportunities/match";
import { displayCost, displayTitle } from "@/lib/labels/display";
import { strings } from "@/lib/strings";
import { dayMonth } from "@/lib/format";

type OpportunityRow = Database["public"]["Tables"]["opportunities"]["Row"];
type FormatKey = keyof typeof strings.opportunities.formats;

/** «Дедлайн ещё открыт» is redundant once the date is shown as its own chip. */
const DEADLINE_OPEN_REASON = "Дедлайн ещё открыт";

const TYPE_ICON: Record<OpportunityType, LucideIcon> = {
  olympiad: Trophy,
  summer_program: Sun,
  internship: Briefcase,
  competition: Award,
  research: FlaskConical,
  scholarship: GraduationCap,
  course: BookOpen,
};

function reasonLabel(reason: string) {
  return reason in strings.opportunities.formats
    ? strings.opportunities.formats[reason as FormatKey]
    : reason;
}

export function OpportunityList({
  items,
  profile,
  today,
}: {
  items: OpportunityRow[];
  profile: OpportunityProfile;
  today: string;
}) {
  return (
    <ul className="grid gap-3">
      {items.map((item) => {
        const reasons = opportunityReasons(profile, item, today).filter(
          (reason) => reason !== DEADLINE_OPEN_REASON || !item.deadline,
        );
        const href = item.url || item.source_url;
        return (
          <li key={item.id}>
            <TCard as="div">
              <h2 className="text-[16px] font-bold leading-tight">{displayTitle(item.title)}</h2>
              <p className="mt-2 flex flex-wrap gap-1.5">
                <StatChip icon={TYPE_ICON[item.type]} value={strings.opportunities.types[item.type]} tone="honey" />
                {item.deadline ? (
                  <StatChip icon={CalendarClock} value={dayMonth(item.deadline.slice(0, 10))} tone="mint" />
                ) : null}
              </p>
              {displayCost(item.cost) ? (
                <p className="mt-2 text-[13px] font-medium text-muted-foreground">{displayCost(item.cost)}</p>
              ) : null}
              {reasons.length > 0 ? (
                <ul className="mt-2 flex flex-wrap gap-1">
                  {reasons.map((reason) => (
                    <li key={reason} className="rounded-full bg-tone-mint-bg px-2 py-0.5 text-[11px] font-bold text-tone-mint-fg">
                      {reasonLabel(reason)}
                    </li>
                  ))}
                </ul>
              ) : null}
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex min-h-11 items-center text-[13px] font-bold text-primary"
              >
                {strings.opportunities.source}
              </a>
            </TCard>
          </li>
        );
      })}
    </ul>
  );
}
