import { redirect } from "next/navigation";

import { AppShellWithRoute } from "@/components/pathway/shell/AppShellWithRoute";
import { displayName } from "@/lib/dashboard/present";
import { toUtcDateString } from "@/lib/matching/dates";
import { computeStreak } from "@/lib/progress/readiness";
import { buildShellData } from "@/lib/shell";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // Never trust getSession() for authorization: getUser() re-validates the
  // token against the Auth server. This is a deliberate second check on top
  // of the proxy, so every protected page is safe even if reached directly.
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  const [{ data: profile }, shortlist, activity] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, city, onboarding_completed, free_only")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("shortlist")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabase.from("activity_days").select("day").eq("user_id", user.id),
  ]);

  if (!profile?.onboarding_completed) {
    redirect("/onboarding");
  }

  const fullName = displayName(profile.full_name, user.email ?? null);
  const streakDays = activity.error
    ? null
    : computeStreak(
        (activity.data ?? []).map((row) => row.day),
        toUtcDateString(new Date()),
      );
  const shell = buildShellData({
    name: fullName,
    city: profile.city,
    email: user.email ?? null,
    shortlistCount: shortlist.error ? null : shortlist.count ?? 0,
    freeOnly: profile.free_only,
    streakDays,
  });

  return (
    <AppShellWithRoute data={shell} userId={user.id}>
      {children}
    </AppShellWithRoute>
  );
}
