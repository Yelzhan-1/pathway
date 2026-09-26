"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { addToShortlist, removeFromShortlist } from "@/lib/actions/shortlist";
import type { UniCard } from "@/types/pathway";

import { PopularUniversities } from "./PopularUniversities";

export function PopularUniversitiesLive({
  unis,
  total,
}: {
  unis: UniCard[] | null;
  total?: number;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <PopularUniversities
      unis={unis}
      total={total}
      onToggleSave={(id, saved) => {
        if (pending) return;
        startTransition(async () => {
          const result = saved
            ? await addToShortlist({ universityId: id, category: "target" })
            : await removeFromShortlist({ universityId: id });
          if (!result.ok) {
            toast.error(result.error_ru);
            router.refresh();
            return;
          }
          router.refresh();
        });
      }}
    />
  );
}
