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

  if (!label) return <span className="sr-only">{strings.cv.saved}</span>;

  return (
    <p
      aria-live="polite"
      className={`text-sm ${status === "error" ? "text-destructive" : "text-muted-foreground"}`}
    >
      {label}
    </p>
  );
}
