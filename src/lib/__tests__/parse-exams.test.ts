import { describe, expect, it } from "vitest";

import { ACADEMIC_EXAM_CODES, LANGUAGE_EXAM_CODES } from "../profile/exam-ranges";
import { parseExams, replaceExamGroup } from "../profile/parse";
import type { ExamEntry } from "../profile/types";

const ielts: ExamEntry = {
  code: "IELTS",
  score: 7,
  status: "taken",
  date: "2026-01-01",
};
const toefl: ExamEntry = {
  code: "TOEFL_IBT",
  score: 100,
  status: "planned",
  date: null,
};
const sat: ExamEntry = {
  code: "SAT",
  score: 1400,
  status: "planned",
  date: null,
  subject: null,
};
const unt: ExamEntry = {
  code: "UNT",
  score: 120,
  status: "taken",
  date: "2026-06-01",
};

describe("replaceExamGroup", () => {
  it("replaces language exams and keeps academic ones", () => {
    const next = replaceExamGroup([ielts, sat], [toefl], LANGUAGE_EXAM_CODES);
    expect(next).toEqual([sat, toefl]);
  });

  it("removes a language exam when the incoming language list is empty", () => {
    const next = replaceExamGroup([ielts, sat], [], LANGUAGE_EXAM_CODES);
    expect(next).toEqual([sat]);
  });

  it("replaces academic exams and keeps language ones", () => {
    const next = replaceExamGroup([ielts, sat], [unt], ACADEMIC_EXAM_CODES);
    expect(next).toEqual([ielts, unt]);
  });

  it("ignores incoming exams that do not belong to the replaced group", () => {
    const next = replaceExamGroup([ielts], [sat, toefl], LANGUAGE_EXAM_CODES);
    expect(next).toEqual([toefl]);
  });
});

describe("parseExams", () => {
  it("drops entries that fail validation", () => {
    expect(
      parseExams([
        { code: "SAT", score: 1400, status: "planned", date: null },
        { code: "SAT", score: 50, status: "planned", date: null },
      ]),
    ).toEqual([sat]);
  });
});
