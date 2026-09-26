import { revalidatePath } from "next/cache";

import type { Json } from "@/lib/database.types";
import { activitiesSchema, cvSchema } from "@/lib/profile/schemas";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response(null, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(null, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return new Response(null, { status: 400 });
  }

  const kind = "kind" in body ? body.kind : null;
  const data = "data" in body ? body.data : null;

  if (kind === "cv") {
    const parsed = cvSchema.safeParse(data);
    if (!parsed.success) return new Response(null, { status: 400 });
    const { error } = await supabase
      .from("profiles")
      .update({ cv: parsed.data as Json })
      .eq("id", user.id);
    if (error) return new Response(null, { status: 400 });
    revalidatePath("/cv");
    return new Response(null, { status: 204 });
  }

  if (kind === "activities") {
    const parsed = activitiesSchema.safeParse(data);
    if (!parsed.success) return new Response(null, { status: 400 });
    const { error } = await supabase
      .from("profiles")
      .update({ activities: parsed.data as Json })
      .eq("id", user.id);
    if (error) return new Response(null, { status: 400 });
    revalidatePath("/cv");
    return new Response(null, { status: 204 });
  }

  return new Response(null, { status: 400 });
}
