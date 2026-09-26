"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { addToShortlist, removeFromShortlist } from "@/lib/actions/shortlist";
import { strings } from "@/lib/strings";
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
          if (saved) {
            const result = await addToShortlist({ universityId: id, category: "target" });
            if (!result.ok) toast.error(result.error_ru);
            router.refresh();
            return;
          }
          const result = await removeFromShortlist({ universityId: id });
          if (!result.ok) {
            toast.error(result.error_ru);
            router.refresh();
            return;
          }
          toast(strings.universities.removed, {
            action: {
              label: strings.common.undo,
              onClick: () => {
                void addToShortlist({
                  universityId: result.data.universityId,
                  category: result.data.category,
                  note: result.data.note ?? undefined,
                }).then((undo) => {
                  if (!undo.ok) toast.error(undo.error_ru);
                  else router.refresh();
                });
              },
            },
          });
          router.refresh();
        });
      }}
    />
  );
}
