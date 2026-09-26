import { describe, expect, it } from "vitest";

import {
  addShortlistInputSchema,
  createAgentTaskInputSchema,
  searchUniversitiesInputSchema,
} from "@/lib/agent/schemas";
import { reviewCv } from "@/lib/agent/cv-review";
import { isOverAgentRateLimit } from "@/lib/agent/rate-limit";
import { emptyCv } from "@/lib/profile/types";

describe("agent guards", () => {
  it("rejects an empty task title and a bad shortlist category", () => {
    expect(createAgentTaskInputSchema.safeParse({ title: "   " }).success).toBe(false);
    expect(
      addShortlistInputSchema.safeParse({
        universityId: "not-a-uuid",
        category: "reach",
      }).success,
    ).toBe(false);
    expect(
      addShortlistInputSchema.safeParse({
        universityId: "11111111-1111-4111-8111-111111111111",
        category: "safety",
      }).success,
    ).toBe(true);
  });

  it("rejects an unknown region filter", () => {
    expect(searchUniversitiesInputSchema.safeParse({ region: "mars" }).success).toBe(false);
    expect(searchUniversitiesInputSchema.safeParse({ region: "usa", freeOrGrantOnly: true }).success).toBe(
      true,
    );
  });

  it("limits user messages to 30 per hour", () => {
    expect(isOverAgentRateLimit(29)).toBe(false);
    expect(isOverAgentRateLimit(30)).toBe(true);
  });

  it("reviews an empty CV with rule suggestions", () => {
    const review = reviewCv(emptyCv());
    expect(review.checks.every((item) => !item.ok)).toBe(true);
    expect(review.suggestions.length).toBe(review.checks.length);
  });
});
