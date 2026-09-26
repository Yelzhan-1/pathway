"use client";

import { strings } from "@/lib/strings";

export function AutosaveIndicator({
  status,
  error,
}: {
  status: "idle" | "saving" | "saved" | "error";
  error: string | null;
}) {
  const label =
    status === "saving"
      ? strings.cv.saving
      : status === "saved"
        ? strings.cv.saved
        : status === "error"
          ? error ?? strings.cv.saveError
          : "";

  return (
    <p
      aria-live="polite"
      aria-atomic="true"
      className={`min-h-5 text-sm ${status === "error" ? "text-destructive" : "text-muted-foreground"}`}
    >
      {label}
    </p>
  );
}
