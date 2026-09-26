import type { Metadata } from "next";

import { DashboardScreen } from "@/components/pathway/dashboard/DashboardScreen";
import { getOpportunities, getProgress, getShortlist } from "@/lib/data";
import { presentDashboard, todayInAlmaty, type UniversityRow } from "@/lib/dashboard/present";
import { getCurrentProfile } from "@/lib/profile/queries";
import { strings } from "@/lib/strings";

export const metadata: Metadata = {
  title: `${strings.nav.dashboard} — ${strings.app.name}`,
};

export default async function DashboardPage() {
  const { user, profile, supabase } = await getCurrentProfile();
  const today = todayInAlmaty(new Date());

  const [shortlist, universities, progress, opportunities, activity] = await Promise.all([
    getShortlist(),
    supabase.from("universities").select("id, slug, name, country, city, majors").order("name"),
    getProgress(),
    getOpportunities(),
    supabase.from("activity_days").select("day").eq("user_id", user.id),
  ]);

  const data = presentDashboard({
    today,
    profile,
    email: user.email ?? null,
    shortlistCount: shortlist.error_ru ? null : shortlist.items.length,
    universities: universities.error ? null : ((universities.data ?? []) as UniversityRow[]),
    universityTotal: universities.error ? null : (universities.data?.length ?? 0),
    shortlistItems: shortlist.error_ru ? null : shortlist.items,
    opportunities: opportunities.error_ru ? null : opportunities.items,
    activityDays: activity.error ? null : (activity.data ?? []).map((row) => row.day),
    progress: progress.error_ru ? null : progress.progress,
  });

  return <DashboardScreen data={data} />;
}
