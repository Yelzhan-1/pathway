import { describe, expect, it } from "vitest";

import { CATALOG_RU } from "@/data/catalog-ru";
import { displayCost, displayTitle, publicNote } from "@/lib/labels/display";

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
});
