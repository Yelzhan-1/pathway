"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/pathway/ui/tropa";
import { postMentorAnswer } from "@/lib/actions/mentor";
import { strings } from "@/lib/strings";

export function MentorAnswerForm({ questionId }: { questionId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="mt-3 grid gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        const form = event.currentTarget;
        startTransition(async () => {
          const result = await postMentorAnswer({
            questionId,
            body: String(new FormData(form).get("body") ?? ""),
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
        {strings.mentors.answerLabel}
        <textarea
          name="body"
          required
          rows={3}
          maxLength={4000}
          className="mt-1 w-full rounded-[18px] bg-background px-4 py-3 text-[14px] font-medium ring-1 ring-border"
        />
      </label>
      <Button type="submit" size="sm" disabled={pending}>
        {strings.mentors.answer}
      </Button>
    </form>
  );
}
