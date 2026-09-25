import { describe, expect, it } from "vitest";

import { loginSchema, signupSchema } from "../validations/auth";

describe("auth validation schemas", () => {
  it("accepts a valid login payload", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "secret123",
    });

    expect(result.success).toBe(true);
  });

  it("rejects an invalid email on login", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "secret123",
    });

    expect(result.success).toBe(false);
  });

  it("rejects a signup password shorter than 8 characters", () => {
    const result = signupSchema.safeParse({
      fullName: "Иван Иванов",
      email: "user@example.com",
      password: "short",
    });

    expect(result.success).toBe(false);
  });
});
