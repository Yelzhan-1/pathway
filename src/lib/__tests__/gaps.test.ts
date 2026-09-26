import { describe, expect, it } from "vitest";

import { gapNextStep } from "@/lib/matching/gaps";

describe("gapNextStep", () => {
  it("sends missing profile fields to the profile anchors", () => {
    expect(gapNextStep({ key: "gpa", message_ru: "добавьте GPA", delta: null })).toEqual({
      href: "/profile#gpa",
      label_ru: "Добавить GPA",
    });
  });

  it("sends a low exam score to the prep plan", () => {
    expect(
      gapNextStep({ key: "english", message_ru: "результат английского ниже требования", delta: "IELTS 5.5 < 6.5" }),
    ).toEqual({
      href: "/exams",
      label_ru: "Открыть план по английскому",
    });
  });
});
