import type { Metadata } from "next";

import { SoonScreen } from "@/components/pathway/shell/SoonScreen";
import { plural } from "@/lib/format";
import { getCurrentProfile } from "@/lib/profile/queries";
import { strings } from "@/lib/strings";

export const metadata: Metadata = {
  title: `${strings.favorites.title} — ${strings.app.name}`,
};

export default async function FavoritesPage() {
  const { user, supabase } = await getCurrentProfile();
  const { count, error } = await supabase
    .from("shortlist")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  const detail = error
    ? strings.favorites.unavailable
    : strings.favorites.count(count ?? 0, plural(count ?? 0, "вуз", "вуза", "вузов"));

  return <SoonScreen title={strings.favorites.title} detail={detail} />;
}
