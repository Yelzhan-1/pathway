import type { Metadata } from "next";

import { FeedbackWidget } from "@/components/pathway/feedback/FeedbackWidget";
import { WhatIfScreen, type WhatIfRow } from "@/components/pathway/what-if/WhatIfScreen";
import { getShortlist, getUniversities } from "@/lib/data";
import { toFitProfile } from "@/lib/data/map";
import { toUtcDateString } from "@/lib/matching/dates";
import { getCurrentProfile } from "@/lib/profile/queries";
import { strings } from "@/lib/strings";

export const metadata: Metadata = {
  title: `${strings.whatIf.title} — ${strings.app.name}`,
};

export default async function WhatIfPage() {
  const today = toUtcDateString(new Date());
  const [{ profile }, shortlist, catalog] = await Promise.all([
    getCurrentProfile(),
    getShortlist(),
    getUniversities(),
  ]);
  const fitProfile = toFitProfile(profile);
  const shortlistIds = new Set(shortlist.items.map((item) => item.university.id));
  const rows: WhatIfRow[] = [
    ...shortlist.items.map((item) => ({
      id: item.university.id,
      name: item.university.name,
      slug: item.university.slug,
      group: "shortlist" as const,
      university: item.university,
    })),
    ...catalog.items
      .filter((item) => !shortlistIds.has(item.id))
      .slice(0, 8)
      .map((item) => ({
        id: item.id,
        name: item.name,
        slug: item.slug,
        group: "catalog" as const,
        university: item,
      })),
  ];

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <WhatIfScreen profile={fitProfile} rows={rows} today={today} />
      <FeedbackWidget page="what-if" />
    </div>
  );
}
