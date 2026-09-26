import type { Metadata } from "next";

import { DashboardScreen } from "@/components/pathway/dashboard/DashboardScreen";
import { presentDashboard, todayInAlmaty, type UniversityRow } from "@/lib/dashboard/present";
import { getCurrentProfile } from "@/lib/profile/queries";
import { strings } from "@/lib/strings";

export const metadata: Metadata = {
  title: `${strings.nav.dashboard} — ${strings.app.name}`,
};

export default async function DashboardPage() {
  const { user, profile, supabase } = await getCurrentProfile();
  const today = todayInAlmaty(new Date());

  const [shortlist, universities] = await Promise.all([
    supabase.from("shortlist").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    supabase
      .from("universities")
      .select("id, name, country, city, majors", { count: "exact" })
      .order("name")
      .limit(3),
  ]);

  const data = presentDashboard({
    today,
    profile,
    email: user.email ?? null,
    shortlistCount: shortlist.error ? null : (shortlist.count ?? 0),
    universities: universities.error ? null : ((universities.data ?? []) as UniversityRow[]),
    universityTotal: universities.error ? null : universities.count,
  });

  return <DashboardScreen data={data} />;
}
