import { describe, expect, it } from "vitest";

import { essayAnalysisSchema, essayRequestSchema, ESSAY_LETTER_MAX_LENGTH, sortEssayCriteria } from "../schema";

function validCriteria() {
  return [
    { id: "language" as const, score: 4, comment: "Грамотно, пара опечаток." },
    { id: "specifics" as const, score: 3, comment: "Мало конкретных примеров." },
    { id: "fit" as const, score: 5, comment: "Хорошо связано с программой." },
    { id: "structure" as const, score: 4, comment: "Логичная структура." },
    { id: "motivation" as const, score: 3, comment: "Цель размыта." },
  ];
}

function validAnalysis() {
  return {
    overallScore: 7,
    verdict: "Письмо в целом готово, но нужно больше конкретики.",
    criteria: validCriteria(),
    strengths: ["Понятная структура", "Искренний тон"],
    blockers: ["Мало конкретных примеров", "Слабая связь с программой"],
    edits: [
      { quote: "Я хочу учиться в этом вузе", rewrite: "Я выбрал эту программу, потому что…", why: "Конкретнее" },
      { quote: "Я много работал", rewrite: "За год я запустил проект X", why: "Есть пример" },
      { quote: "Спасибо за внимание", rewrite: "Жду возможности внести вклад в программу", why: "Сильнее финал" },
    ],
    nextStep: "Добавь один конкретный пример достижения в третий абзац.",
  };
}

describe("essayRequestSchema", () => {
  it("accepts a valid letter and university slug", () => {
    const result = essayRequestSchema.safeParse({ letter: "Текст письма", universitySlug: "mit" });
    expect(result.success).toBe(true);
  });

  it("rejects an empty letter", () => {
    const result = essayRequestSchema.safeParse({ letter: "   ", universitySlug: "mit" });
    expect(result.success).toBe(false);
  });

  it("rejects a letter longer than the max length", () => {
    const result = essayRequestSchema.safeParse({
      letter: "a".repeat(ESSAY_LETTER_MAX_LENGTH + 1),
      universitySlug: "mit",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a missing university slug", () => {
    const result = essayRequestSchema.safeParse({ letter: "Текст письма", universitySlug: "" });
    expect(result.success).toBe(false);
  });
});

describe("essayAnalysisSchema", () => {
  it("accepts a fully valid analysis", () => {
    const result = essayAnalysisSchema.safeParse(validAnalysis());
    expect(result.success).toBe(true);
  });

  it("rejects a criterion score outside 1-5", () => {
    const analysis = validAnalysis();
    analysis.criteria[0].score = 6;
    const result = essayAnalysisSchema.safeParse(analysis);
    expect(result.success).toBe(false);
  });

  it("rejects when a criterion id is duplicated instead of covering all five", () => {
    const analysis = validAnalysis();
    analysis.criteria[0] = { ...analysis.criteria[1] };
    const result = essayAnalysisSchema.safeParse(analysis);
    expect(result.success).toBe(false);
  });

  it("rejects fewer than 2 strengths", () => {
    const analysis = validAnalysis();
    analysis.strengths = ["Только один пункт"];
    const result = essayAnalysisSchema.safeParse(analysis);
    expect(result.success).toBe(false);
  });

  it("rejects fewer than 3 edits", () => {
    const analysis = validAnalysis();
    analysis.edits = analysis.edits.slice(0, 2);
    const result = essayAnalysisSchema.safeParse(analysis);
    expect(result.success).toBe(false);
  });

  it("rejects an overallScore outside 1-10", () => {
    const analysis = validAnalysis();
    analysis.overallScore = 11;
    const result = essayAnalysisSchema.safeParse(analysis);
    expect(result.success).toBe(false);
  });
});

describe("sortEssayCriteria", () => {
  it("reorders criteria into the fixed specifics/fit/motivation/structure/language order", () => {
    const parsed = essayAnalysisSchema.parse(validAnalysis());
    const sorted = sortEssayCriteria(parsed);
    expect(sorted.criteria.map((criterion) => criterion.id)).toEqual([
      "specifics",
      "fit",
      "motivation",
      "structure",
      "language",
    ]);
  });

  it("leaves the input analysis unchanged", () => {
    const parsed = essayAnalysisSchema.parse(validAnalysis());
    sortEssayCriteria(parsed);
    expect(parsed.criteria[0].id).toBe("language");
  });
});
