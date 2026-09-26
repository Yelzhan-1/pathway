import { describe, expect, it } from "vitest";

import {
  asksForUniversityMatches,
  englishLookupLine,
  forcedToolChoice,
  historyForCurrentUniversity,
  matchToolChoice,
  profileMatchContext,
  universityFactsContext,
  universityNamedInMessage,
  wantsGrantMatches,
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

  it("says the minimum is unpublished and does not invent a secondary-source orientation", () => {
    const withNote = englishLookupLine({
      name: "KAIST",
      ieltsMin: null,
      toeflMin: null,
      duolingoMin: null,
      englishRequirementRu: "Нет данных",
      orientationRu:
        "English test scores not verified on official page (secondary sources say recommended, not mandatory).",
    });
    expect(withNote).toBe("KAIST не публикует минимальный IELTS/TOEFL.");
    expect(withNote).not.toMatch(/сторонн/);
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
      orientationRu: null,
    });
    expect(context).toContain("getUniversityDetails");
    expect(context).toContain("kaist");
    expect(context).toContain("KAIST не публикует минимальный IELTS/TOEFL");
    expect(context).toContain("https://www.kaist.ac.kr");
    expect(context).not.toContain(NOT_IN_DATABASE_RU);
    expect(context).not.toMatch(/сторонн/);
    expect(context).toMatch(/только про KAIST/);
  });
});

describe("profile-backed university matches", () => {
  it("treats a grant question as a catalog search and not a single-university lookup", () => {
    const message = "Какие вузы мне подходят с грантом?";
    expect(asksForUniversityMatches(message, CATALOG)).toBe(true);
    expect(wantsGrantMatches(message)).toBe(true);
    expect(universityNamedInMessage(message, CATALOG)).toBeNull();
    expect(matchToolChoice(0, true)).toEqual({ type: "tool", toolName: "searchUniversities" });
    expect(matchToolChoice(1, true)).toBeUndefined();
  });

  it("injects the profile and concrete universities instead of asking for them again", () => {
    const context = profileMatchContext({
      grantOnly: true,
      profile: {
        intendedMajor: "Компьютерные науки",
        budgetUsd: 10000,
        needsScholarship: true,
        exams: [{ code: "IELTS", score: "6.5" }],
        shortlist: [{ name: "KAIST", category: "Мечта" }],
      },
      matches: [
        { name: "SDU", categoryRu: "Цель", sourceUrl: "https://sdu.edu.kz" },
        { name: "KBTU", categoryRu: "Запасной", sourceUrl: "https://kbtu.edu.kz" },
      ],
    });
    expect(context).toContain("Компьютерные науки");
    expect(context).toContain("10 000 $");
    expect(context).toContain("нужна");
    expect(context).toContain("IELTS 6.5");
    expect(context).toContain("KAIST (Мечта)");
    expect(context).toContain("SDU: Цель");
    expect(context).toContain("KBTU: Запасной");
    expect(context).toMatch(/Не спрашивай/);
  });
});

describe("historyForCurrentUniversity", () => {
  it("drops earlier KAIST turns when the current question is about MIT", () => {
    const kept = historyForCurrentUniversity(
      [
        { role: "user", content: "Какой IELTS нужен в KAIST?" },
        { role: "assistant", content: "KAIST не публикует минимальный IELTS/TOEFL." },
        { role: "user", content: "А бюджет?" },
        { role: "assistant", content: "Бюджет в профиле 10 000 $." },
      ],
      "Какой IELTS нужен в MIT?",
      CATALOG,
    );
    expect(kept).toEqual([
      { role: "user", content: "А бюджет?" },
      { role: "assistant", content: "Бюджет в профиле 10 000 $." },
    ]);
  });
});
