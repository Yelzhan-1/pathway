"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/pathway/ui/tropa";
import { createTask } from "@/lib/actions/tasks";
import { strings } from "@/lib/strings";

export function TaskComposer() {
  const [pending, startTransition] = useTransition();
  const [titleError, setTitleError] = useState<string | null>(null);

  return (
    <form
      className="grid gap-3 rounded-[var(--radius-card)] bg-card p-4 shadow-card ring-1 ring-border"
      onSubmit={(event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const data = new FormData(form);
        const title = String(data.get("title") ?? "").trim();
        const dueDate = String(data.get("dueDate") ?? "").trim();
        const description = String(data.get("description") ?? "").trim();
        if (!title) {
          setTitleError(strings.tasks.titleRequired);
          return;
        }
        setTitleError(null);
        startTransition(async () => {
          const result = await createTask({
            title,
            dueDate: dueDate || undefined,
            description: description || undefined,
          });
          if (!result.ok) {
            toast.error(result.error_ru);
            return;
          }
          form.reset();
        });
      }}
    >
      <label className="block text-[13px] font-bold">
        {strings.tasks.name}
        <input
          name="title"
          maxLength={200}
          aria-invalid={titleError ? true : undefined}
          className="mt-1 h-11 w-full rounded-full bg-background px-4 text-[14px] font-medium ring-1 ring-border"
        />
        {titleError ? <span className="mt-1 block text-[13px] font-semibold text-destructive">{titleError}</span> : null}
      </label>
      <label className="block text-[13px] font-bold">
        {strings.tasks.due}
        <input
          name="dueDate"
          type="date"
          className="mt-1 h-11 w-full rounded-full bg-background px-4 text-[14px] font-medium ring-1 ring-border"
        />
      </label>
      <label className="block text-[13px] font-bold">
        {strings.tasks.notes}
        <textarea
          name="description"
          rows={3}
          maxLength={4000}
          className="mt-1 w-full rounded-[18px] bg-background px-4 py-3 text-[14px] font-medium ring-1 ring-border"
        />
      </label>
      <Button type="submit" size="sm" disabled={pending}>
        {strings.tasks.add}
      </Button>
    </form>
  );
}
