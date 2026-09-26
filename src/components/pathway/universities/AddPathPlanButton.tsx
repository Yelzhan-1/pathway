"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/pathway/ui/tropa";
import { addPathPlan } from "@/lib/actions/path";
import { strings } from "@/lib/strings";

export function AddPathPlanButton({
  universityId,
  comboIndex,
  disabled,
}: {
  universityId: string;
  comboIndex: number;
  disabled?: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      size="sm"
      disabled={pending || disabled}
      onClick={() => {
        startTransition(async () => {
          const result = await addPathPlan({ universityId, comboIndex });
          if (!result.ok) {
            toast.error(result.error_ru);
            return;
          }
          toast.success(strings.universities.pathAdded(result.data.inserted, result.data.unchanged));
        });
      }}
    >
      {strings.universities.pathAdd}
    </Button>
  );
}
