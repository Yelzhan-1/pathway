"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/pathway/ui/tropa";
import { postMentorQuestion } from "@/lib/actions/mentor";
import { strings } from "@/lib/strings";

export function MentorQuestionForm() {
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="grid gap-3 rounded-[var(--radius-card)] bg-card p-4 shadow-card ring-1 ring-border"
      id="ask"
      onSubmit={(event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const data = new FormData(form);
        const tags = String(data.get("tags") ?? "")
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean);
        startTransition(async () => {
          const result = await postMentorQuestion({
            title: String(data.get("title") ?? ""),
            body: String(data.get("body") ?? ""),
            tags: tags.length > 0 ? tags : undefined,
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
        {strings.mentors.titleLabel}
        <input
          name="title"
          required
          minLength={3}
          maxLength={200}
          className="mt-1 h-11 w-full rounded-full bg-background px-4 text-[14px] font-medium ring-1 ring-border"
        />
      </label>
      <label className="block text-[13px] font-bold">
        {strings.mentors.bodyLabel}
        <textarea
          name="body"
          required
          rows={4}
          maxLength={4000}
          className="mt-1 w-full rounded-[18px] bg-background px-4 py-3 text-[14px] font-medium ring-1 ring-border"
        />
      </label>
      <label className="block text-[13px] font-bold">
        {strings.mentors.tagsLabel}
        <input
          name="tags"
          placeholder={strings.mentors.tagsHint}
          className="mt-1 h-11 w-full rounded-full bg-background px-4 text-[14px] font-medium ring-1 ring-border"
        />
      </label>
      <Button type="submit" size="sm" disabled={pending}>
        {strings.mentors.ask}
      </Button>
    </form>
  );
}
