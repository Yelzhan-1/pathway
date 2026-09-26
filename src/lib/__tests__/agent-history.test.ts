import { describe, expect, it } from "vitest";

import { AGENT_GENERIC_ERROR_RU, AGENT_UNAVAILABLE_RU } from "@/lib/agent/errors";
import { historyForModel } from "@/lib/agent/messages";
import { NOT_IN_DATABASE_RU } from "@/lib/agent/prompt";

describe("historyForModel", () => {
  it("drops placeholder assistant replies and the user turn they answered", () => {
    const kept = historyForModel([
      { role: "user", content: "Какой IELTS нужен в KAIST?" },
      { role: "assistant", content: NOT_IN_DATABASE_RU },
      { role: "user", content: "А в MIT?" },
      { role: "assistant", content: "…" },
      { role: "user", content: "Ещё раз" },
      { role: "assistant", content: "Попробуй ещё раз" },
      { role: "user", content: "   " },
      { role: "assistant", content: "   " },
      { role: "user", content: "Дедлайн NU?" },
      { role: "assistant", content: AGENT_UNAVAILABLE_RU },
      { role: "user", content: "Снова" },
      { role: "assistant", content: AGENT_GENERIC_ERROR_RU },
      { role: "user", content: "Стоимость Yale?" },
      { role: "assistant", content: "Обучение 72 500 $ в год." },
    ]);

    expect(kept).toEqual([
      { role: "user", content: "Стоимость Yale?" },
      { role: "assistant", content: "Обучение 72 500 $ в год." },
    ]);
  });

  it("keeps a real answer that a university does not publish an English minimum", () => {
    const rows = [
      { role: "user" as const, content: "Какой IELTS нужен в KAIST?" },
      {
        role: "assistant" as const,
        content: "KAIST не публикует минимальный IELTS/TOEFL.",
      },
    ];
    expect(historyForModel(rows)).toEqual(rows);
  });

  it("leaves a user turn that has no assistant reply yet", () => {
    const rows = [{ role: "user" as const, content: "Какой IELTS нужен в KAIST?" }];
    expect(historyForModel(rows)).toEqual(rows);
  });
});
