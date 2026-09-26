import { describe, expect, it } from "vitest";

import { displayMajor, uniqueDisplayMajors } from "@/lib/matching/synonyms";
import {
  aidLabel,
  displayCost,
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

  it("translates deadline notes, majors, a free cost, and the ЕНТ title", () => {
    expect(publicNote("Early admissions close at 6 PM KST")).toBe(
      "ранний приём заканчивается в 18:00 по времени Кореи (KST)",
    );
    expect(
      publicNote(
        "Early admissions (Spring or Fall 2027 entry): apply 22 Sep–22 Oct 2026 6 PM KST; recommendation by 29 Oct; results 7 Jan 2027",
      ),
    ).toBe(
      "ранний приём (поступление весной или осенью 2027): подача 22 сен–22 окт 2026 18:00 по времени Кореи (KST); рекомендация до 29 окт; результаты 7 янв 2027",
    );
    expect(
      publicNote(
        "Regular admissions (Fall 2027 only): apply 10 Nov 2026–14 Jan 2027 6 PM KST; recommendation by 21 Jan; results 25 Mar 2027",
      ),
    ).toBe(
      "основной приём (только осень 2027): подача 10 ноя 2026–14 янв 2027 18:00 по времени Кореи (KST); рекомендация до 21 янв; результаты 25 мар 2027",
    );
    expect(roundLabel("REA")).toBe("Ограниченный ранний приём");
    expect(publicNote("Restrictive Early Action (non-binding); test scores needed by end of November (ideally end of October).")).toBe(
      "ограниченный ранний приём (без обязательства); баллы нужны до конца ноября (лучше до конца октября).",
    );
    expect(roundLabel("SCEA")).toBe("Единственный ранний приём");
    expect(publicNote("Single-choice early action (non-binding). Financial aid application due 9 Nov.")).toBe(
      "единственный ранний приём (без обязательства). заявка на помощь до 9 ноя.",
    );
    expect(displayCost("funded")).toBe("с финансированием");
    expect(displayCost("unknown")).toBe("стоимость не указана");
    expect(displayCost("paid: max USD 11,800 (2026), need-based discounts up to free incl. travel")).toBe(
      "платно: максимум 11,800 $ (2026), скидки по потребности вплоть до бесплатно, включая проезд",
    );
    expect(displayMajor("Government")).toBe("Государственное управление");
    expect(displayMajor("History")).toBe("История");
    expect(
      uniqueDisplayMajors([
        "Mathematics",
        "Math",
        "Statistics",
        "Government",
      ]),
    ).toEqual(["Математика и статистика", "Государственное управление"]);
    expect(displayCost("free")).toBe("бесплатно");
    expect(displayCost("not free")).toBe("not free");
    expect(examLabel("UNT")).toBe("ЕНТ");
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
