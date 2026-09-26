import { createClient } from "@/lib/supabase/server";

import type { DbClient } from "./activity";

export async function getActionContext(): Promise<
  | { ok: true; supabase: DbClient; userId: string }
  | { ok: false; error_ru: string }
> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return { ok: false, error_ru: "Войдите в аккаунт." };
  return { ok: true, supabase, userId: user.id };
}
