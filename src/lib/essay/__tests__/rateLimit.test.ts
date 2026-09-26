import { describe, expect, it } from "vitest";

import { createEssayRateLimiter, ESSAY_HOURLY_USER_LIMIT, isOverEssayRateLimit } from "../rateLimit";

describe("isOverEssayRateLimit", () => {
  it("is false below the limit", () => {
    expect(isOverEssayRateLimit(ESSAY_HOURLY_USER_LIMIT - 1)).toBe(false);
  });

  it("is true at or above the limit", () => {
    expect(isOverEssayRateLimit(ESSAY_HOURLY_USER_LIMIT)).toBe(true);
    expect(isOverEssayRateLimit(ESSAY_HOURLY_USER_LIMIT + 1)).toBe(true);
  });
});

describe("createEssayRateLimiter", () => {
  it("starts at zero for a new user", () => {
    const limiter = createEssayRateLimiter();
    expect(limiter.recentCount("user-1")).toBe(0);
  });

  it("counts recorded usage for the same user", () => {
    const limiter = createEssayRateLimiter();
    const now = Date.now();
    limiter.record("user-1", now);
    limiter.record("user-1", now);
    expect(limiter.recentCount("user-1", now)).toBe(2);
  });

  it("keeps usage isolated per user", () => {
    const limiter = createEssayRateLimiter();
    const now = Date.now();
    limiter.record("user-1", now);
    expect(limiter.recentCount("user-2", now)).toBe(0);
  });

  it("prunes usage older than the window", () => {
    const windowMs = 60 * 60 * 1000;
    const limiter = createEssayRateLimiter(windowMs);
    const now = Date.now();
    limiter.record("user-1", now - windowMs - 1000);
    expect(limiter.recentCount("user-1", now)).toBe(0);
  });

  it("reaches the rate limit after ESSAY_HOURLY_USER_LIMIT records", () => {
    const limiter = createEssayRateLimiter();
    const now = Date.now();
    for (let i = 0; i < ESSAY_HOURLY_USER_LIMIT; i += 1) {
      limiter.record("user-1", now);
    }
    expect(isOverEssayRateLimit(limiter.recentCount("user-1", now))).toBe(true);
  });
});
