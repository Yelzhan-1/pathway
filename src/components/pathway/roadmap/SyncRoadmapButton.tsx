"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/pathway/ui/tropa";
import { syncRoadmapTasks } from "@/lib/actions/roadmap";
import { strings } from "@/lib/strings";

export function SyncRoadmapButton() {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          const result = await syncRoadmapTasks();
          if (!result.ok) {
            toast.error(result.error_ru);
            return;
          }
          toast.success(strings.roadmap.synced(result.data.inserted, result.data.updated));
        });
      }}
    >
      {strings.roadmap.sync}
    </Button>
  );
}
