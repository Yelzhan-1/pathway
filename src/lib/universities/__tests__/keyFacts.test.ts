import { describe, expect, it } from "vitest";

import { universityKeyFacts } from "../keyFacts";

describe("universityKeyFacts", () => {
  it("shows price, grant and IELTS when all are known", () => {
    const facts = universityKeyFacts({
      tuition_usd_per_year: 72500,
      aid_for_internationals: "need_blind",
      ielts_min: 6.5,
    });
    expect(facts.map((f) => f.icon)).toEqual(["price", "grant", "ielts"]);
    expect(facts[0].value).toBe("72 500 $");
    expect(facts[2].value).toBe("IELTS 6.5+");
  });

  it("treats a $0 tuition as free", () => {
    const facts = universityKeyFacts({ tuition_usd_per_year: 0, aid_for_internationals: null, ielts_min: null });
    expect(facts).toEqual([{ icon: "price", value: "Бесплатно" }]);
  });

  it("skips unknown fields instead of guessing", () => {
    const facts = universityKeyFacts({ tuition_usd_per_year: null, aid_for_internationals: null, ielts_min: null });
    expect(facts).toEqual([]);
  });

  it("caps the list at 3 facts", () => {
    const facts = universityKeyFacts({ tuition_usd_per_year: 1000, aid_for_internationals: "merit", ielts_min: 7 });
    expect(facts.length).toBeLessThanOrEqual(3);
  });
});
