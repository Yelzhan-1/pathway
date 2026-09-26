import { describe, expect, it } from "vitest";

import { displayMajor, uniqueDisplayMajors } from "@/lib/matching/synonyms";
import {
  aidLabel,
  displayCost,
  displayTitle,
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

  it("translates Yale tuition and the state educational grant", () => {
    expect(
      publicNote(
        "2026–27 tuition USD 72,500 (plus activity fee $185, housing $12,080, food $9,520, books $1,000, personal $2,700).",
      ),
    ).toBe(
      "2026–27 обучение 72,500 $ (плюс взнос за мероприятия 185 $, проживание 12,080 $, питание 9,520 $, учебники 1,000 $, личные расходы 2,700 $).",
    );
    expect(displayTitle("Nazarbayev University state educational grant")).toBe(
      "Государственный образовательный грант Nazarbayev University",
    );
    expect(displayTitle("Kazakhstan State Educational Grant (bachelor)")).toBe(
      "Государственный образовательный грант Казахстана (бакалавриат)",
    );
    expect(displayCost("state educational grant")).toBe("государственный образовательный грант");
    expect(publicNote("State educational grants (Kazakhstan citizens, via UNT).")).toBe(
      "государственные образовательные гранты (граждане Казахстана, через ЕНТ).",
    );
  });

  it("clears English content words from other catalog notes and titles", () => {
    const allowed = new Set(
      [
        "amherst",
        "bowdoin",
        "cambridge",
        "ceu",
        "css",
        "dartmouth",
        "duke",
        "eth",
        "gpa",
        "harvard",
        "hkust",
        "ielts",
        "imperial",
        "kaist",
        "kimep",
        "mit",
        "nazarbayev",
        "university",
        "nu",
        "nus",
        "nyuad",
        "oxford",
        "princeton",
        "sat",
        "stanford",
        "toefl",
        "tum",
        "ucl",
        "unt",
        "yale",
        "global",
        "korea",
        "austria",
        "bilkent",
        "profile",
        "vat",
      ].map((word) => word.toLowerCase()),
    );
    const samples = [
      "2026–27 tuition USD 75,330; comprehensive fee (tuition, housing, meals, activities) USD 95,650.",
      "Need-blind for international applicants; meets 100% of calculated need for admitted internationals who apply for aid.",
      "USD 18,400 per year (incl. 10% VAT) for international students admitted in 2026.",
      "2026–27 tuition USD 71,697 (three terms); total budget USD 98,427 (plus health insurance $5,216 if needed, computer $1,700).",
      "100% need-based aid; international students eligible for exactly the same aid; meets 100% of demonstrated need.",
      "2026–2027 tuition USD 66,720; total cost of attendance USD 92,760.",
      "Need-based MIT Scholarship; MIT meets full demonstrated need for all admitted students.",
      "Undergraduate tuition USD 15,000 for 2026/2027. Most Kazakhstan citizens study on the NU state educational grant.",
      "Tuition JPY 642,960 per year; admission fee JPY 282,000.",
      "Global Korea Scholarship (GKS) – Undergraduate",
      "KAIST Scholarship for international undergraduates",
      "Admitted international students receive the KAIST Scholarship (full tuition exemption for 8 semesters), so tuition amount not recorded.",
      "Tuition waiver scholarships at five levels (20%–100%) based on grades and exam scores.",
      "Need-blind for all applicants regardless of citizenship; meets 100% of demonstrated need.",
      "Non-EU: EUR 7,100 per academic year from 2026/27. Application fee CZK 1,500.",
      "Threefold tuition fee CHF 2,190 per semester for students without Swiss residence/citizenship.",
      "Institutional fee non-EU/EFTA 2025-2026: EUR 17,310 per year.",
      "Computer Science BSc Overseas fee shown as GBP 48,600 per year (Home GBP 10,050).",
      "last cycle (2025-26), verify. International aid materials due within 7 days of admission offer.",
      "All admitted international undergraduates receive full tuition exemption for 8 semesters.",
    ];
    const leftovers = samples.flatMap((sample) => {
      const shown = publicNote(sample) ?? displayTitle(sample);
      return (shown.match(/[A-Za-z][A-Za-z'-]{3,}/g) ?? []).filter((word) => !allowed.has(word.toLowerCase()));
    });
    expect(leftovers).toEqual([]);
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
