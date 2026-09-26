import { describe, expect, it } from "vitest";

import { submitFeedbackSchema } from "@/lib/actions/schemas";
import { feedbackStorageKey, localDayString, universityFeedbackPage } from "@/lib/feedback/storage";

describe("submitFeedbackSchema", () => {
  it("accepts a 1–5 score and optional comment", () => {
    const parsed = submitFeedbackSchema.parse({
      page: "dashboard",
      helpful: 4,
      comment: "  ясно  ",
    });
    expect(parsed).toEqual({ page: "dashboard", helpful: 4, comment: "ясно" });
  });

  it("rejects scores outside 1–5", () => {
    expect(submitFeedbackSchema.safeParse({ page: "dashboard", helpful: 0 }).success).toBe(false);
    expect(submitFeedbackSchema.safeParse({ page: "dashboard", helpful: 6 }).success).toBe(false);
  });
});

describe("feedback storage keys", () => {
  it("scopes one vote per page per day", () => {
    expect(feedbackStorageKey("dashboard", "2026-09-26")).toBe("pathway:feedback:dashboard:2026-09-26");
    expect(universityFeedbackPage("mit")).toBe("universities/mit");
    expect(localDayString(new Date("2026-09-26T12:00:00+05:00"))).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
