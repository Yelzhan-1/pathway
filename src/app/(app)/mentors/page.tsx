import type { Metadata } from "next";

import { MentorBoard } from "@/components/pathway/mentors/MentorBoard";
import { MentorQuestionForm } from "@/components/pathway/mentors/MentorQuestionForm";
import { Books } from "@/components/pathway/ui/illustrations";
import { EmptyCta, PageHeader } from "@/components/pathway/ui/tropa";
import { getMentorBoard, getSettings } from "@/lib/data";
import { strings } from "@/lib/strings";

export const metadata: Metadata = {
  title: `${strings.mentors.title} — ${strings.app.name}`,
};

export default async function MentorsPage() {
  const [board, settings] = await Promise.all([getMentorBoard(), getSettings()]);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title={strings.mentors.title} subtitle={strings.mentors.answerNote} illustration={<Books className="w-full" />} />
      <MentorQuestionForm />
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
