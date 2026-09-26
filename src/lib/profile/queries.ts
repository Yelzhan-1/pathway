import type { User } from "@supabase/supabase-js";

import type { Database } from "@/lib/database.types";
import { parseProfile } from "@/lib/profile/parse";
import { emptyProfile, getCountryLabel, type ProfileData } from "@/lib/profile/types";
import { requireUser } from "@/lib/supabase/require-user";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

export async function getCurrentProfile(): Promise<{
  user: User;
  profile: ProfileData;
  supabase: Awaited<ReturnType<typeof requireUser>>["supabase"];
  updatedAt: string | null;
}> {
  const { supabase, user } = await requireUser();

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (data) {
    return {
      user,
      profile: parseProfile(data),
      supabase,
      updatedAt: data.updated_at,
    };
  }

  const metadataName = user.user_metadata?.full_name;
  const fullName = typeof metadataName === "string" ? metadataName : null;

  await supabase.from("profiles").insert({
    id: user.id,
    full_name: fullName,
  });

  const { data: created } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return {
    user,
    profile: created ? parseProfile(created as ProfileRow) : emptyProfile(),
    supabase,
    updatedAt: created?.updated_at ?? null,
  };
}

export async function getCatalogCountries(): Promise<string[]> {
  const { supabase } = await requireUser();
  const { data } = await supabase.from("universities").select("country");
  const unique = new Set<string>();
  for (const row of data ?? []) {
    if (row.country) unique.add(row.country);
  }
  return [...unique].sort((a, b) =>
    getCountryLabel(a).localeCompare(getCountryLabel(b), "ru"),
  );
}
