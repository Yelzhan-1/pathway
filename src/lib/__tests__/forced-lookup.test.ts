import { describe, expect, it } from "vitest";

import {
  englishLookupLine,
  englishOrientationRu,
  forcedToolChoice,
  universityFactsContext,
  universityNamedInMessage,
} from "@/lib/agent/forced-lookup";
import { NOT_IN_DATABASE_RU } from "@/lib/agent/prompt";

const CATALOG = [
  { slug: "kaist", name: "KAIST" },
  { slug: "mit", name: "MIT" },
  { slug: "nu", name: "Nazarbayev University" },
];

describe("universityNamedInMessage", () => {
  it("resolves KAIST from a Russian question, in any case", () => {
    expect(universityNamedInMessage("Какой IELTS нужен в KAIST?", CATALOG)).toEqual({
      slug: "kaist",
      name: "KAIST",
    });
    expect(universityNamedInMessage("какой ielts нужен в kaist?", CATALOG)).toEqual({
      slug: "kaist",
      name: "KAIST",
    });
  });

  it("resolves a multi-word name and ignores a message with no university", () => {
    expect(universityNamedInMessage("Дедлайн Nazarbayev University", CATALOG)).toEqual({
      slug: "nu",
      name: "Nazarbayev University",
    });
    expect(universityNamedInMessage("Какая погода завтра?", CATALOG)).toBeNull();
  });
});

describe("forced university lookup", () => {
  it("requires getUniversityDetails on the first step when a university is named", () => {
    expect(forcedToolChoice(0, "kaist")).toEqual({
      type: "tool",
      toolName: "getUniversityDetails",
    });
    expect(forcedToolChoice(1, "kaist")).toBeUndefined();
    expect(forcedToolChoice(0, null)).toBeUndefined();
  });

  it("says the minimum is unpublished and adds an orientation only when the card has one", () => {
    const orientation = englishOrientationRu({
      other: "English test scores not verified on official page (secondary sources say recommended, not mandatory).",
    });
    const withNote = englishLookupLine({
      name: "KAIST",
      ieltsMin: null,
      toeflMin: null,
      duolingoMin: null,
      englishRequirementRu: "Нет данных",
      orientationRu: orientation,
    });
    expect(withNote).toBe(
      "KAIST не публикует минимальный IELTS/TOEFL; ориентир: по сторонним источникам тест рекомендуют, но он не обязателен",
    );
    expect(withNote).not.toBe(NOT_IN_DATABASE_RU);

    const withoutNote = englishLookupLine({
      name: "KAIST",
      ieltsMin: null,
      toeflMin: null,
      duolingoMin: null,
      englishRequirementRu: "Нет данных",
      orientationRu: null,
    });
    expect(withoutNote).toBe("KAIST не публикует минимальный IELTS/TOEFL.");
    expect(withoutNote).not.toMatch(/ориентир/);
    expect(englishOrientationRu(null)).toBeNull();
    expect(englishOrientationRu({ other: "portfolio required" })).toBeNull();
  });

  it("quotes the published English minimum and injects the slug without the empty-database phrase", () => {
    const line = englishLookupLine({
      name: "MIT",
      ieltsMin: 7,
      toeflMin: 90,
      duolingoMin: 120,
      englishRequirementRu: "IELTS 7 / TOEFL iBT 90 / DET 120",
      orientationRu: "по сторонним источникам тест рекомендуют, но он не обязателен",
    });
    expect(line).toBe("MIT: IELTS 7 / TOEFL iBT 90 / DET 120");
    expect(line).not.toMatch(/не публикует/);

    const context = universityFactsContext({
      name: "KAIST",
      slug: "kaist",
      sourceUrl: "https://www.kaist.ac.kr",
      ieltsMin: null,
      toeflMin: null,
      duolingoMin: null,
      englishRequirementRu: "Нет данных",
      orientationRu: "по сторонним источникам тест рекомендуют, но он не обязателен",
    });
    expect(context).toContain("getUniversityDetails");
    expect(context).toContain("kaist");
    expect(context).toContain("KAIST не публикует минимальный IELTS/TOEFL");
    expect(context).not.toContain(NOT_IN_DATABASE_RU);
  });
});
