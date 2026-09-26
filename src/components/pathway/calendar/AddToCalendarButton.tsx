"use client";

import { CalendarPlus } from "lucide-react";

import { Button } from "@/components/pathway/ui/tropa";
import { buildIcsCalendar, type IcsEvent } from "@/lib/calendar/ics";
import { strings } from "@/lib/strings";
import { cn } from "@/lib/utils";

function downloadIcs(filename: string, events: readonly IcsEvent[]) {
  const content = buildIcsCalendar(events);
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/** «Добавить в календарь» — downloads a .ics file for one deadline or a whole batch. No server round-trip. */
export function AddToCalendarButton({
  events,
  filename,
  label,
  iconOnly = false,
  variant = "soft",
  size = "sm",
  className,
}: {
  events: readonly IcsEvent[];
  filename: string;
  label?: string;
  /** Renders a small round icon-only button — for tight header rows on narrow screens. */
  iconOnly?: boolean;
  variant?: "primary" | "honey" | "soft" | "ghost" | "inverse";
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  if (events.length === 0) return null;
  const text = label ?? strings.calendar.add;
  if (iconOnly) {
    return (
      <button
        type="button"
        aria-label={text}
        onClick={() => downloadIcs(filename, events)}
        className={cn("grid size-9 shrink-0 place-items-center rounded-full bg-secondary text-foreground", className)}
      >
        <CalendarPlus className="size-[18px]" aria-hidden />
      </button>
    );
  }
  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={className}
      onClick={() => downloadIcs(filename, events)}
    >
      <CalendarPlus className="size-4" aria-hidden />
      {text}
    </Button>
  );
}
