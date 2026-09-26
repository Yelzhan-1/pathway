import { describe, expect, it } from "vitest";

import { commitPendingExam, parseScoreInput } from "../profile/pending-exam";

describe("parseScoreInput", () => {
  it("treats empty and whitespace as missing, not zero", () => {
    expect(parseScoreInput("", false)).toBeUndefined();
    expect(parseScoreInput("   ", false)).toBeUndefined();
    expect(parseScoreInput("0", false)).toBe(0);
    expect(parseScoreInput("7.5", false)).toBe(7.5);
  });
});

describe("commitPendingExam", () => {
  it("ignores an empty draft", () => {
    const current = [
      { code: "SAT" as const, score: 1400, status: "planned" as const, date: null },
    ];
    expect(
      commitPendingExam(current, {
        code: "UNT",
        scoreRaw: "",
        status: "planned",
        date: "",
        subject: "",
      }),
    ).toEqual({ ok: true, exams: current });
  });

  it("auto-adds a valid pending row", () => {
    const result = commitPendingExam([], {
      code: "UNT",
      scoreRaw: "120",
      status: "planned",
      date: "",
      subject: "",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.exams).toEqual([
        {
          code: "UNT",
          score: 120,
          status: "planned",
          date: null,
          subject: null,
        },
      ]);
    }
  });

  it("blocks a partially filled draft", () => {
    const result = commitPendingExam([], {
      code: "SAT",
      scoreRaw: "",
      status: "planned",
      date: "2026-09-01",
      subject: "",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/экзамен|балл/i);
    }
  });
});
