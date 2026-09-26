import { describe, expect, it } from "vitest";

import {
  formatExamEntry,
  getBudgetLabel,
  getEnglishLevelLabel,
  getExamCodeLabel,
} from "../profile/labels";
import { strings } from "../strings";

describe("getExamCodeLabel", () => {
  it("maps exam codes to human labels", () => {
    expect(getExamCodeLabel("UNT")).toBe("ЕНТ");
    expect(getExamCodeLabel("IELTS")).toBe("IELTS");
    expect(getExamCodeLabel("TOEFL_IBT")).toBe("TOEFL iBT");
    expect(getExamCodeLabel("DET")).toBe("Duolingo");
    expect(getExamCodeLabel("SAT")).toBe("SAT");
    expect(getExamCodeLabel("ACT")).toBe("ACT");
    expect(getExamCodeLabel("AP")).toBe("AP");
    expect(getExamCodeLabel("IB_DP")).toBe("IB");
    expect(getExamCodeLabel("A_LEVEL")).toBe("A-Level");
    expect(getExamCodeLabel("NUET")).toBe("NUET");
  });
});

describe("getEnglishLevelLabel", () => {
  it("maps none to the onboarding copy", () => {
    expect(getEnglishLevelLabel("none")).toBe("Не изучал / не знаю");
  });
});

describe("getBudgetLabel", () => {
  it("shows the chosen range, and grants-only for 0", () => {
    expect(getBudgetLabel(0)).toBe("Только гранты");
    expect(getBudgetLabel(20000)).toBe("10 000–20 000 $");
  });
});

describe("formatExamEntry", () => {
  it("uses the human exam name", () => {
    expect(
      formatExamEntry({
        code: "UNT",
        score: 120,
        status: "taken",
        date: "2026-06-01",
      }),
    ).toBe("ЕНТ: 120");
  });

  it("can append a planned suffix", () => {
    expect(
      formatExamEntry(
        { code: "SAT", score: 1400, status: "planned", date: null },
        strings.cv.plannedSuffix,
      ),
    ).toBe("SAT: 1400 (план)");
  });
});
