"use client";

import { useMemo, useState } from "react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useChat } from "@ai-sdk/react";

import { MentorMark } from "@/components/pathway/primitives/MentorMark";
import { Button } from "@/components/pathway/ui/tropa";
import { textFromParts } from "@/lib/agent/messages";
import { strings } from "@/lib/strings";
import { cn } from "@/lib/utils";

async function agentFetch(input: RequestInfo | URL, init?: RequestInit) {
  const response = await fetch(input, init);
  if (response.ok) return response;
  const payload = (await response.json().catch(() => null)) as { error?: string } | null;
  throw new Error(payload?.error || strings.assistant.unavailable);
}

function messageText(message: UIMessage, streaming: boolean) {
  const text = textFromParts(message.parts).trim();
  if (text && text !== "…") return text;
  if (message.role !== "assistant") return "";
  return streaming ? "…" : strings.assistant.tryAgain;
}

export function AssistantChat({ initialMessages }: { initialMessages: UIMessage[] }) {
  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/agent", fetch: agentFetch }),
    [],
  );
  const { messages, sendMessage, status, error, stop } = useChat({
    messages: initialMessages,
    transport,
  });
  const [draft, setDraft] = useState("");
  const pending = status === "submitted" || status === "streaming";

  return (
    <div className="flex flex-col gap-4">
      <p className="text-[12px] font-bold text-muted-foreground">{strings.assistant.label}</p>
      {messages.length === 0 ? (
        <p className="rounded-[20px] border-2 border-dashed border-input p-4 text-[15px] font-bold">
          {strings.assistant.empty}
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {messages.map((message) => {
            const assistant = message.role === "assistant";
            return (
              <li
                key={message.id}
                className={cn("flex gap-2", assistant ? "items-start" : "flex-row-reverse items-end")}
              >
                {assistant ? <MentorMark size={36} /> : null}
                <p
                  className={cn(
                    "max-w-[min(100%,36rem)] whitespace-pre-wrap rounded-[18px] px-3.5 py-2.5 text-[14px] font-semibold leading-snug",
                    assistant
                      ? "rounded-tl-[4px] bg-secondary"
                      : "rounded-tr-[4px] bg-primary text-primary-foreground",
                  )}
                >
                  {messageText(message, pending)}
                </p>
              </li>
            );
          })}
        </ul>
      )}
      {error ? (
        <p role="alert" className="rounded-[20px] bg-danger-soft px-4 py-3 text-[14px] font-semibold text-destructive">
          {error.message || strings.assistant.unavailable}
        </p>
      ) : null}
      <form
        className="flex flex-col gap-2 sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          const text = draft.trim();
          if (!text || pending) return;
          setDraft("");
          void sendMessage({ text });
        }}
      >
        <label className="sr-only" htmlFor="assistant-input">
          {strings.assistant.placeholder}
        </label>
        <textarea
          id="assistant-input"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          rows={2}
          maxLength={4000}
          placeholder={strings.assistant.placeholder}
          className="min-h-11 flex-1 rounded-[18px] bg-card px-4 py-3 text-[14px] font-medium ring-1 ring-border"
        />
        {pending ? (
          <Button type="button" variant="soft" onClick={() => stop()}>
            {strings.assistant.stop}
          </Button>
        ) : (
          <Button type="submit" disabled={!draft.trim()}>
            {strings.assistant.send}
          </Button>
        )}
      </form>
    </div>
  );
}
