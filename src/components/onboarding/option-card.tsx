"use client";

import ClickSpark from "@/components/react-bits/ClickSpark";
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
    <ClickSpark sparkColor="#075E46" sparkRadius={22} sparkCount={6} sparkSize={8}>
      <button
        type="button"
        role="radio"
        aria-checked={selected}
        disabled={disabled}
        onClick={onSelect}
        className={cn(
          "press flex min-h-11 w-full flex-col items-start justify-center rounded-[18px] bg-card px-4 py-3 text-left shadow-chunky-soft ring-1 ring-border",
          "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring",
          "disabled:pointer-events-none disabled:opacity-50",
          selected && "bg-secondary ring-2 ring-primary",
        )}
      >
        <span className="font-bold">{title}</span>
        {description ? (
          <span className={cn("text-sm", selected ? "text-secondary-foreground" : "text-muted-foreground")}>
            {description}
          </span>
        ) : null}
      </button>
    </ClickSpark>
  );
}
