import { describe, expect, it } from "vitest";

import { isFreeCost, matchOpportunities, opportunityReasons, type OpportunityInput } from "@/lib/opportunities/match";

const TODAY = "2026-09-26";

function opportunity(overrides: Partial<OpportunityInput> = {}): OpportunityInput {
  return {
    slug: "opp",
    title: "Opp",
    type: "olympiad",
    eligibility: null,
    grades: ["11 класс"],
    deadline: "2026-10-01",
    cost: "Free",
    format: "online",
    source_url: "https://example.org/opp",
    ...overrides,
  };
}

describe("isFreeCost", () => {
  it("detects free, paid, and unclear cost text", () => {
    expect(isFreeCost(null)).toBeNull();
    expect(isFreeCost("  ")).toBeNull();
    expect(isFreeCost("Free")).toBe(true);
    expect(isFreeCost("Бесплатно")).toBe(true);
    expect(isFreeCost("Fully funded")).toBe(true);
    expect(isFreeCost("$0")).toBe(true);
    expect(isFreeCost("0 USD")).toBe(true);
    expect(isFreeCost("not free")).toBe(false);
    expect(isFreeCost("платно")).toBe(false);
    expect(isFreeCost("$500")).toBe(false);
    expect(isFreeCost("150 USD")).toBe(false);
    expect(isFreeCost("registration fee")).toBe(false);
    expect(isFreeCost("see the website")).toBeNull();
  });
});

describe("matchOpportunities", () => {
  it("keeps a matching grade and drops a past deadline when upcomingOnly is set", () => {
    const items = matchOpportunities(
      { grade_or_year: "11 класс", path: "graduate" },
      [
        opportunity({ slug: "soon", title: "Soon", deadline: "2026-10-02" }),
        opportunity({ slug: "later", title: "Later", deadline: "2026-11-01" }),
        opportunity({ slug: "past", title: "Past", deadline: "2026-01-01" }),
        opportunity({ slug: "other-grade", title: "Other", grades: ["9 класс"] }),
      ],
      { upcomingOnly: true },
      TODAY,
    );
    expect(items.map((item) => item.slug)).toEqual(["soon", "later"]);
  });

  it("keeps a row when grades are empty and filters freeOnly", () => {
    const items = matchOpportunities(
      { grade_or_year: "11 класс", path: "graduate" },
      [
        opportunity({ slug: "open", grades: [], cost: "see website" }),
        opportunity({ slug: "paid", grades: [], cost: "$20" }),
        opportunity({ slug: "free", grades: null, cost: "бесплатно" }),
      ],
      { freeOnly: true },
      TODAY,
    );
    expect(items.map((item) => item.slug)).toEqual(["free"]);
  });

  it("uses path when the eligibility text is explicit and grades are empty", () => {
    const items = matchOpportunities(
      { grade_or_year: null, path: "transfer" },
      [
        opportunity({
          slug: "school",
          grades: [],
          eligibility: "High school students only",
        }),
        opportunity({
          slug: "uni",
          grades: [],
          eligibility: "Undergraduate students",
        }),
      ],
      {},
      TODAY,
    );
    expect(items.map((item) => item.slug)).toEqual(["uni"]);
  });
});

describe("opportunityReasons", () => {
  it("explains grade, free cost, and an open deadline", () => {
    const reasons = opportunityReasons(
      { grade_or_year: "11 класс", path: "graduate" },
      opportunity({ grades: ["11 класс"], cost: "бесплатно", deadline: "2026-10-01", format: "online" }),
      TODAY,
    );
    expect(reasons).toEqual(["Подходит по классу: 11 класс", "Бесплатно", "Дедлайн ещё открыт", "online"]);
  });
});
