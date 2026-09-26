import type { Metadata } from "next";

import { MentorBoard } from "@/components/pathway/mentors/MentorBoard";
import { MentorQuestionForm } from "@/components/pathway/mentors/MentorQuestionForm";
import { Display, EmptyCta } from "@/components/pathway/ui/tropa";
import { getMentorBoard, getSettings } from "@/lib/data";
import { strings } from "@/lib/strings";

export const metadata: Metadata = {
  title: `${strings.mentors.title} — ${strings.app.name}`,
};

export default async function MentorsPage() {
  const [board, settings] = await Promise.all([getMentorBoard(), getSettings()]);

  return (
    <div className="flex flex-col gap-4">
      <Display as="h1" className="text-[28px] font-bold sm:text-[32px]">
        {strings.mentors.title}
      </Display>
      <MentorQuestionForm />
      <p className="text-[13px] font-medium text-muted-foreground">{strings.mentors.answerNote}</p>
      {board.error_ru ? (
        <p role="alert" className="rounded-[20px] bg-danger-soft px-4 py-3 text-[14px] font-semibold text-destructive">
          {board.error_ru}
        </p>
      ) : board.questions.length === 0 ? (
        <EmptyCta title={strings.mentors.empty} cta={strings.mentors.ask} href="#ask" />
      ) : (
        <MentorBoard questions={board.questions} canAnswer={settings.isMentor} />
      )}
    </div>
  );
}
