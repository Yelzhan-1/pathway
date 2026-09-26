"use client";

import { cn } from "cn";

export function OptionCard({
  selected,
  onSelect,
  title,
  description,
  disabled = false,
}: {
  selected: boolean;
  onSelect: () => void;
  title: string;
  description?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        "flex min-h-11 w-full flex-col items-start justify-center rounded-xl border px-4 py-3 text-left transition-colors",
        "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
        "disabled:pointer-events-none disabled:opacity-50",
        selected
          ? "border-primary bg-accent text-accent-foreground"
          : "hover:bg-muted/50",
      )}
    >
      <span className="font-medium">{title}</span>
      {description ? (
        <span
          className={cn(
            "text-sm",
            selected ? "text-accent-foreground" : "text-muted-foreground",
          )}
        >
          {description}
        </span>
      ) : null}
    </button>
  );
}
