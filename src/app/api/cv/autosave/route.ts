import { revalidatePath } from "next/cache";

import type { Json } from "@/lib/database.types";
import { parseActivities, parseCv } from "@/lib/profile/parse";
import { updateProfileOptimistic } from "@/lib/profile/optimistic-update";
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
  const expectedUpdatedAt =
    "expectedUpdatedAt" in body && typeof body.expectedUpdatedAt === "string"
      ? body.expectedUpdatedAt
      : null;

  if (kind === "cv") {
    const parsed = cvSchema.safeParse(data);
    if (!parsed.success) return new Response(null, { status: 400 });
    const result = await updateProfileOptimistic(
      supabase,
      user.id,
      expectedUpdatedAt,
      { cv: parsed.data as Json },
    );
    if (result.ok) {
      revalidatePath("/cv");
      return Response.json({ updatedAt: result.updatedAt }, { status: 200 });
    }
    if (result.kind === "conflict") {
      return Response.json(
        { updatedAt: result.updatedAt, data: parseCv(result.cv) },
        { status: 409 },
      );
    }
    return new Response(null, { status: 400 });
  }

  if (kind === "activities") {
    const parsed = activitiesSchema.safeParse(data);
    if (!parsed.success) return new Response(null, { status: 400 });
    const result = await updateProfileOptimistic(
      supabase,
      user.id,
      expectedUpdatedAt,
      { activities: parsed.data as Json },
    );
    if (result.ok) {
      revalidatePath("/cv");
      return Response.json({ updatedAt: result.updatedAt }, { status: 200 });
    }
    if (result.kind === "conflict") {
      return Response.json(
        {
          updatedAt: result.updatedAt,
          data: parseActivities(result.activities),
        },
        { status: 409 },
      );
    }
    return new Response(null, { status: 400 });
  }

  return new Response(null, { status: 400 });
}
