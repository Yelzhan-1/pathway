import { describe, expect, it } from "vitest";

import { CATALOG_RU } from "@/data/catalog-ru";
import { displayCost, displayTitle, publicNote, roundLabel } from "@/lib/labels/display";

/** Proper names and acronyms may stay. Three other Latin words in a row may not. */
const ALLOWED = new Set(
  [
    "cs50x",
    "ioai",
    "sat",
    "act",
    "ielts",
    "toefl",
    "gpa",
    "css",
    "nuet",
    "kst",
    "cet",
    "jst",
    "ucas",
    "tmua",
    "imo",
    "ibo",
    "icho",
    "igeo",
    "ioaa",
    "ioi",
    "iol",
    "ipho",
    "isef",
    "iymc",
    "izho",
    "egmo",
    "hmmt",
    "rsi",
    "ssp",
    "usaco",
    "mext",
    "gks",
    "uwc",
    "yygs",
    "nasa",
    "mit",
    "kaist",
    "ects",
  ].map((word) => word.toLowerCase()),
);

function threeLatinWords(text: string): string | null {
  const run: string[] = [];
  for (const raw of text.split(/\s+/)) {
    const token = raw.replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9]+$/g, "");
    const latin = /^[A-Za-z][A-Za-z0-9'.+-]*$/.test(token);
    if (!latin || ALLOWED.has(token.toLowerCase())) {
      run.length = 0;
      continue;
    }
    run.push(token);
    if (run.length >= 3) return run.join(" ");
  }
  return null;
}

describe("catalog Russian sentences", () => {
  it("shows a Russian sentence instead of the stored English", () => {
    const sdu =
      "2026–2027 fees are ECTS-based and published only as an attachment (not captured). One-time student fee 60,000 KZT (grant holders also pay).";
    expect(publicNote(sdu)).toMatch(/тенге/);
    expect(publicNote(sdu)).not.toMatch(/published only/);
    expect(displayTitle("Republican Olympiad in general-education subjects (grades 9–11)")).toMatch(
      /Республиканская/,
    );
  });

  it("fails when a displayed catalog sentence has three Latin words in a row", () => {
    const offenders = Object.entries(CATALOG_RU).flatMap(([source, russian]) => {
      const shown = publicNote(source) ?? displayTitle(source) ?? displayCost(source) ?? russian;
      const run = threeLatinWords(shown);
      return run ? [`${run} ← ${source.slice(0, 80)}`] : [];
    });
    expect(offenders).toEqual([]);
  });

  it("translates deadline round labels, including SDU intakes", () => {
    const rounds = [
      "international – spring intake",
      "international - fall intake",
      "state grant applications",
      "paid tuition applications",
    ];
    expect(roundLabel("international – spring intake")).toBe("иностранцы — весенний набор");
    expect(roundLabel("state grant applications")).toBe("заявки на госгрант");
    expect(roundLabel("paid tuition applications")).toBe("заявки на платное обучение");
    expect(roundLabel("international – fall intake")).toBe("иностранцы — осенний набор");
    const offenders = rounds.flatMap((round) => {
      const run = threeLatinWords(roundLabel(round));
      return run ? [run] : [];
    });
    expect(offenders).toEqual([]);
    expect(
      publicNote(
        "Non-EU tuition for B.Sc. Informatics: EUR 3,000 per semester (programme page), plus semester (student union) fee EUR 97.00 listed on programme page. TUM bachelor tuition for non-EU is usually EUR 2,000 or 3,000 per semester.",
      ),
    ).toMatch(/информатике/);
    expect(
      publicNote(
        "Tuition-fee waiver scholarships for academic performance or financial need; TUM scholarship for international students: one-time grant of EUR 500–1,800 per semester (TUM tuition page).",
      ),
    ).toMatch(/Стипендии за успеваемость или по финансовой нужде/);
  });

  it("writes dollar amounts with a space between thousands", () => {
    const commaThousands = Object.values(CATALOG_RU).filter((russian) => /\d,\d{3}(?!\d)/.test(russian));
    expect(commaThousands).toEqual([]);
    expect(publicNote("2026–27 tuition USD 72,500 (plus activity fee $185, housing $12,080, food $9,520, books $1,000, personal $2,700).")).toContain(
      "72 500 $",
    );
  });
});
