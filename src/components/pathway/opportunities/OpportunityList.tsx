import type { Database } from "@/lib/database.types";
import { opportunityReasons, type OpportunityProfile } from "@/lib/opportunities/match";
import { strings } from "@/lib/strings";
import { dayMonth } from "@/lib/format";

type OpportunityRow = Database["public"]["Tables"]["opportunities"]["Row"];
type FormatKey = keyof typeof strings.opportunities.formats;

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
        const reasons = opportunityReasons(profile, item, today);
        const href = item.url || item.source_url;
        const typeLabel = strings.opportunities.types[item.type];
        return (
          <li key={item.id} className="rounded-[var(--radius-card)] bg-card p-4 shadow-card ring-1 ring-border">
            <p className="text-[12px] font-bold text-muted-foreground">{typeLabel}</p>
            <h2 className="mt-1 text-[16px] font-bold leading-tight">{item.title}</h2>
            {item.deadline ? (
              <p className="mt-1 text-[13px] font-semibold text-ink-2">{dayMonth(item.deadline.slice(0, 10))}</p>
            ) : null}
            {item.cost ? <p className="text-[13px] font-medium text-muted-foreground">{item.cost}</p> : null}
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
          </li>
        );
      })}
    </ul>
  );
}
