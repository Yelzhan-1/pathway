import { describe, expect, it } from "vitest";

import { getSafeRedirectPath } from "../safe-redirect";

describe("getSafeRedirectPath", () => {
  it("accepts a plain relative path", () => {
    expect(getSafeRedirectPath("/tasks")).toBe("/tasks");
  });

  it("rejects a protocol-relative path", () => {
    expect(getSafeRedirectPath("//evil.com")).toBe("/dashboard");
  });

  it("rejects a backslash-prefixed path", () => {
    expect(getSafeRedirectPath("/\\evil.com")).toBe("/dashboard");
  });

  it("rejects an absolute URL", () => {
    expect(getSafeRedirectPath("https://evil.com")).toBe("/dashboard");
  });

  it("falls back to /dashboard for an empty value", () => {
    expect(getSafeRedirectPath("")).toBe("/dashboard");
    expect(getSafeRedirectPath(null)).toBe("/dashboard");
    expect(getSafeRedirectPath(undefined)).toBe("/dashboard");
  });

  it("rejects values containing control characters", () => {
    expect(getSafeRedirectPath("/tasks\r\nSet-Cookie: a=b")).toBe(
      "/dashboard",
    );
  });
});
