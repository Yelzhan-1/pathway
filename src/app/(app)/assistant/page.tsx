import type { Metadata } from "next";

import { AssistantChat } from "@/components/pathway/assistant/AssistantChat";
import { FeedbackWidget } from "@/components/pathway/feedback/FeedbackWidget";
import { Compass } from "@/components/pathway/ui/illustrations";
import { PageHeader } from "@/components/pathway/ui/tropa";
import { rowsToUiMessages } from "@/lib/agent/messages";
import { getAgentHistory } from "@/lib/data";
import { strings } from "@/lib/strings";

export const metadata: Metadata = {
  title: `${strings.assistant.title} — ${strings.app.name}`,
};

export default async function AssistantPage() {
  const { messages, error_ru } = await getAgentHistory();

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title={strings.assistant.title} illustration={<Compass className="w-full" />} />
      {error_ru ? (
        <p role="alert" className="rounded-[20px] bg-danger-soft px-4 py-3 text-[14px] font-semibold text-destructive">
          {error_ru}
        </p>
      ) : (
        <>
          <AssistantChat initialMessages={rowsToUiMessages(messages)} />
          <FeedbackWidget page="assistant" />
        </>
      )}
    </div>
  );
}
