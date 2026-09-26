import type { UIMessage } from "ai";

import type { Json } from "@/lib/database.types";

import { AGENT_GENERIC_ERROR_RU, AGENT_UNAVAILABLE_RU } from "./errors";
import { NOT_IN_DATABASE_RU } from "./prompt";

export type ModelHistoryRow = {
  role: "user" | "assistant";
  content: string;
};

function canonicalAssistant(content: string): string {
  return content
    .trim()
    .replace(/^[\s«"'“”]+|[\s»"'“”.!?]+$/g, "")
    .trim()
    .toLocaleLowerCase("ru");
}

const PLACEHOLDER_ASSISTANT = new Set(
  ["…", "...", "Попробуй ещё раз", NOT_IN_DATABASE_RU, AGENT_UNAVAILABLE_RU, AGENT_GENERIC_ERROR_RU].map(
    canonicalAssistant,
  ),
);

/** True when an assistant turn is empty or a stored error/fallback, not a real answer. */
export function isPlaceholderAssistant(content: string): boolean {
  const text = content.trim();
  if (!text) return true;
  const key = canonicalAssistant(text);
  if (!key) return true;
  return PLACEHOLDER_ASSISTANT.has(key);
}

/** Model context only. Placeholder assistant turns and the user turn they answered are omitted. */
export function historyForModel<T extends ModelHistoryRow>(rows: readonly T[]): T[] {
  const kept: T[] = [];
  for (const row of rows) {
    if (row.role === "assistant" && isPlaceholderAssistant(row.content)) {
      if (kept.at(-1)?.role === "user") kept.pop();
      continue;
    }
    kept.push(row);
  }
  return kept;
}

export function textFromParts(parts: unknown): string {
  if (!Array.isArray(parts)) return "";
  return parts
    .map((part) => {
      if (!part || typeof part !== "object") return "";
      const row = part as { type?: string; text?: string };
      return row.type === "text" && typeof row.text === "string" ? row.text : "";
    })
    .filter(Boolean)
    .join("\n")
    .trim();
}

export function partsToJson(parts: unknown): Json {
  return JSON.parse(JSON.stringify(parts ?? [])) as Json;
}

export function rowsToUiMessages(
  rows: Array<{ id: string; role: "user" | "assistant"; content: string; parts: Json }>,
): UIMessage[] {
  return rows.map((row) => {
    const raw = Array.isArray(row.parts) ? row.parts : [];
    const parts =
      raw.length > 0 ? (raw as UIMessage["parts"]) : [{ type: "text" as const, text: row.content }];
    return { id: row.id, role: row.role, parts };
  });
}
