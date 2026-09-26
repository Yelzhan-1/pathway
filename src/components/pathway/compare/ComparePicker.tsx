"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { Button } from "@/components/pathway/ui/tropa";
import { strings } from "@/lib/strings";

export function ComparePicker({
  options,
  selectedIds,
}: {
  options: { id: string; name: string }[];
  selectedIds: string[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [picked, setPicked] = useState<string[]>(selectedIds);

  const canSubmit = useMemo(() => picked.length >= 2 && picked.length <= 4, [picked.length]);

  return (
    <form
      className="rounded-[var(--radius-card)] bg-card p-4 shadow-card ring-1 ring-border"
      onSubmit={(event) => {
        event.preventDefault();
        if (!canSubmit) return;
        const params = new URLSearchParams();
        for (const id of picked) params.append("ids", id);
        startTransition(() => router.push(`/compare?${params.toString()}`));
      }}
    >
      <p className="text-[14px] font-bold">{strings.compare.pick}</p>
      <ul className="mt-3 space-y-1">
        {options.map((option) => {
          const on = picked.includes(option.id);
          const blocked = !on && picked.length >= 4;
          return (
            <li key={option.id}>
              <label className="flex min-h-11 items-center gap-3 rounded-[14px] px-2 hover:bg-secondary">
                <input
                  type="checkbox"
                  checked={on}
                  disabled={blocked || pending}
                  onChange={() => {
                    setPicked((current) =>
                      on ? current.filter((id) => id !== option.id) : [...current, option.id],
                    );
                  }}
                  className="size-4 accent-primary"
                />
                <span className="text-[14px] font-semibold">{option.name}</span>
              </label>
            </li>
          );
        })}
      </ul>
      <Button type="submit" size="sm" className="mt-3" disabled={!canSubmit || pending}>
        {strings.compare.show}
      </Button>
    </form>
  );
}
