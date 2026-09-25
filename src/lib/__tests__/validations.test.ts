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

  it("rejects an empty email on login with a clear message", () => {
    const result = loginSchema.safeParse({ email: "", password: "secret123" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Введите email.");
    }
  });

  it("rejects an empty password on login with a clear message", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Введите пароль.");
    }
  });

  it("rejects a signup password shorter than 8 characters", () => {
    const result = signupSchema.safeParse({
      fullName: "Иван Иванов",
      email: "user@example.com",
      password: "short1",
    });

    expect(result.success).toBe(false);
  });

  it("rejects a signup password with only digits (e.g. 12345678)", () => {
    const result = signupSchema.safeParse({
      fullName: "Иван Иванов",
      email: "user@example.com",
      password: "12345678",
    });

    expect(result.success).toBe(false);
  });

  it("rejects a signup password with only letters (no digit)", () => {
    const result = signupSchema.safeParse({
      fullName: "Иван Иванов",
      email: "user@example.com",
      password: "abcdefgh",
    });

    expect(result.success).toBe(false);
  });

  it("accepts a signup password with a letter and a digit, 8+ chars", () => {
    const result = signupSchema.safeParse({
      fullName: "Иван Иванов",
      email: "user@example.com",
      password: "secret123",
    });

    expect(result.success).toBe(true);
  });
});
