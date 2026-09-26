import { describe, expect, it } from "vitest";

import { displayMajor } from "@/lib/matching/synonyms";
import {
  aidLabel,
  examLabel,
  formatMoneyUsd,
  publicNote,
  roundLabel,
} from "@/lib/labels/display";
import { strings } from "@/lib/strings";

describe("display labels", () => {
  it("formats money, aid, rounds, and exam codes in Russian", () => {
    expect(formatMoneyUsd(10000)).toBe("10 000 $");
    expect(aidLabel("need_blind")).toBe("Без учёта дохода");
    expect(aidLabel("merit")).toBe("За успехи");
    expect(aidLabel("funded")).toBe("С финансированием");
    expect(roundLabel("main")).toBe("Основной");
    expect(roundLabel("Early")).toBe("Ранний");
    expect(examLabel("TOEFL_IBT")).toBe("TOEFL iBT");
    expect(examLabel("UNT")).toBe("ЕНТ");
  });

  it("hides internal notes", () => {
    expect(publicNote("price list is published as a scanned PDF")).toBeNull();
  });

  it("drops «(offered)» from program names", () => {
    expect(displayMajor("Computer Science (offered)")).toBe("Компьютерные науки");
  });

  it("uses requirement labels instead of «Пока нет»", () => {
    expect(strings.fit.check.below).toBe("Ниже требования");
    expect(strings.fit.check.unknown).toBe("Нет данных");
    expect(strings.fit.check.not_required).toBe("Нет требования");
  });

  it("keeps free-only distinct from needs-scholarship and uses «Неделя 1»", () => {
    expect(strings.preference.freeOnly).toBe("Только бесплатно / грант");
    expect(strings.onboarding.steps.budget.scholarship).toBe("Нужна стипендия");
    expect(strings.exams.week(1)).toBe("Неделя 1");
    expect(strings.roadmap.title).toBe("Дорожная карта");
    expect(strings.favorites.groupHeading("Мечта", 2)).toBe("Мечта · 2");
  });
});
