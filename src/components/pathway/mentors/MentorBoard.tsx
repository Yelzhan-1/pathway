import { MentorAnswerForm } from "@/components/pathway/mentors/MentorAnswerForm";
import { dayMonth } from "@/lib/format";
import type { MentorBoardQuestion } from "@/lib/data/load";
import { strings } from "@/lib/strings";
import { cn } from "@/lib/utils";

function AuthorMark({ isMentor }: { isMentor: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex min-h-8 items-center rounded-full px-2.5 text-[11.5px] font-bold",
        isMentor ? "bg-tone-mint-bg text-tone-mint-fg" : "bg-secondary text-muted-foreground",
      )}
    >
      {isMentor ? strings.mentors.badge : strings.mentors.participant}
    </span>
  );
}

export function MentorBoard({
  questions,
  canAnswer,
}: {
  questions: MentorBoardQuestion[];
  canAnswer: boolean;
}) {
  return (
    <ul className="grid gap-4">
      {questions.map((question) => (
        <li key={question.id} className="rounded-[var(--radius-card)] bg-card p-4 shadow-card ring-1 ring-border">
          <div className="flex flex-wrap items-center gap-2">
            <AuthorMark isMentor={question.isMentor} />
            <span className="text-[12px] font-semibold text-muted-foreground">
              {dayMonth(question.created_at.slice(0, 10))}
            </span>
          </div>
          <h2 className="mt-2 text-[16px] font-bold leading-tight">{question.title}</h2>
          <p className="mt-2 whitespace-pre-wrap text-[14px] font-medium leading-snug">{question.body}</p>
          {question.tags.length > 0 ? (
            <ul className="mt-2 flex flex-wrap gap-1">
              {question.tags.map((tag) => (
                <li key={tag} className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-bold text-ink-2">
                  {tag}
                </li>
              ))}
            </ul>
          ) : null}
          <div className="mt-4">
            <h3 className="text-[12px] font-extrabold text-muted-foreground">{strings.mentors.answers}</h3>
            {question.answers.length === 0 ? (
              <p className="mt-2 text-[13.5px] font-medium text-muted-foreground">{strings.mentors.emptyAnswers}</p>
            ) : (
              <ul className="mt-2 space-y-3">
                {question.answers.map((answer) => (
                  <li key={answer.id} className="rounded-[16px] bg-secondary px-3 py-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <AuthorMark isMentor={answer.isMentor} />
                      <span className="text-[12px] font-semibold text-muted-foreground">
                        {dayMonth(answer.created_at.slice(0, 10))}
                      </span>
                    </div>
                    <p className="mt-1.5 whitespace-pre-wrap text-[14px] font-medium leading-snug">{answer.body}</p>
                  </li>
                ))}
              </ul>
            )}
            {canAnswer ? <MentorAnswerForm questionId={question.id} /> : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
