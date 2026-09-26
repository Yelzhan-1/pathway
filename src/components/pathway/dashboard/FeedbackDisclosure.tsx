"use client";

import { useState } from "react";
import { strings } from "@/lib/strings";
import { FeedbackWidget } from "../feedback/FeedbackWidget";

/** Small «Помогло ли тебе?» link that expands into the full feedback form on demand. */
export function FeedbackDisclosure({ page }: { page: string }) {
  const [open, setOpen] = useState(false);
  if (open) return <FeedbackWidget page={page} />;
  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className="inline-flex min-h-11 items-center rounded-full px-3 text-[13px] font-bold text-muted-foreground underline-offset-2 hover:underline"
    >
      {strings.dashboard.feedbackLink}
    </button>
  );
}
