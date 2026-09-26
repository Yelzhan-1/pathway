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
