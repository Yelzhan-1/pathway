import type { UIMessage } from "ai";

import type { Json } from "@/lib/database.types";

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
