import { describe, expect, it } from "vitest";

import {
  examEntrySchema,
  gpaStepSchema,
  statusStepSchema,
} from "../profile/schemas";

describe("examEntrySchema", () => {
  it("accepts UNT at 0 and 140", () => {
    expect(
      examEntrySchema.safeParse({
        code: "UNT",
        score: 0,
        status: "planned",
        date: null,
      }).success,
    ).toBe(true);
    expect(
      examEntrySchema.safeParse({
        code: "UNT",
        score: 140,
        status: "taken",
        date: "2026-06-01",
      }).success,
    ).toBe(true);
  });

  it("rejects UNT above 140", () => {
    expect(
      examEntrySchema.safeParse({
        code: "UNT",
        score: 141,
        status: "planned",
      }).success,
    ).toBe(false);
  });

  it("accepts SAT at 400 and 1600, rejects 399 and 1601", () => {
    expect(
      examEntrySchema.safeParse({
        code: "SAT",
        score: 400,
        status: "planned",
      }).success,
    ).toBe(true);
    expect(
      examEntrySchema.safeParse({
        code: "SAT",
        score: 1600,
        status: "planned",
      }).success,
    ).toBe(true);
    expect(
      examEntrySchema.safeParse({
        code: "SAT",
        score: 399,
        status: "planned",
      }).success,
    ).toBe(false);
    expect(
      examEntrySchema.safeParse({
        code: "SAT",
        score: 1601,
        status: "planned",
      }).success,
    ).toBe(false);
  });

  it("accepts IELTS half-step scores and rejects others", () => {
    expect(
      examEntrySchema.safeParse({
        code: "IELTS",
        score: 6.5,
        status: "planned",
      }).success,
    ).toBe(true);
    expect(
      examEntrySchema.safeParse({
        code: "IELTS",
        score: 9,
        status: "planned",
      }).success,
    ).toBe(true);
    expect(
      examEntrySchema.safeParse({
        code: "IELTS",
        score: 6.3,
        status: "planned",
      }).success,
    ).toBe(false);
    expect(
      examEntrySchema.safeParse({
        code: "IELTS",
        score: 9.5,
        status: "planned",
      }).success,
    ).toBe(false);
  });

  it("validates TOEFL iBT, DET, ACT, AP, IB DP and NUET ranges", () => {
    expect(
      examEntrySchema.safeParse({
        code: "TOEFL_IBT",
        score: 0,
        status: "planned",
      }).success,
    ).toBe(true);
    expect(
      examEntrySchema.safeParse({
        code: "TOEFL_IBT",
        score: 121,
        status: "planned",
      }).success,
    ).toBe(false);
    expect(
      examEntrySchema.safeParse({
        code: "DET",
        score: 10,
        status: "planned",
      }).success,
    ).toBe(true);
    expect(
      examEntrySchema.safeParse({
        code: "DET",
        score: 9,
        status: "planned",
      }).success,
    ).toBe(false);
    expect(
      examEntrySchema.safeParse({
        code: "ACT",
        score: 36,
        status: "planned",
      }).success,
    ).toBe(true);
    expect(
      examEntrySchema.safeParse({
        code: "ACT",
        score: 0,
        status: "planned",
      }).success,
    ).toBe(false);
    expect(
      examEntrySchema.safeParse({
        code: "AP",
        score: 5,
        status: "planned",
        subject: "Calculus BC",
      }).success,
    ).toBe(true);
    expect(
      examEntrySchema.safeParse({
        code: "AP",
        score: 6,
        status: "planned",
      }).success,
    ).toBe(false);
    expect(
      examEntrySchema.safeParse({
        code: "IB_DP",
        score: 45,
        status: "planned",
      }).success,
    ).toBe(true);
    expect(
      examEntrySchema.safeParse({
        code: "IB_DP",
        score: 46,
        status: "planned",
      }).success,
    ).toBe(false);
    expect(
      examEntrySchema.safeParse({
        code: "NUET",
        score: 240,
        status: "planned",
      }).success,
    ).toBe(true);
    expect(
      examEntrySchema.safeParse({
        code: "NUET",
        score: 241,
        status: "planned",
      }).success,
    ).toBe(false);
  });

  it("accepts A-Level letter grades and optional subject", () => {
    expect(
      examEntrySchema.safeParse({
        code: "A_LEVEL",
        score: "A*",
        status: "planned",
        subject: "Mathematics",
      }).success,
    ).toBe(true);
    expect(
      examEntrySchema.safeParse({
        code: "A_LEVEL",
        score: "F",
        status: "planned",
      }).success,
    ).toBe(false);
  });

  it("requires a date when status is taken", () => {
    expect(
      examEntrySchema.safeParse({
        code: "SAT",
        score: 1200,
        status: "taken",
      }).success,
    ).toBe(false);
  });
});

describe("gpaStepSchema", () => {
  it("accepts a GPA within the 5-point scale", () => {
    expect(gpaStepSchema.safeParse({ gpa: 4.5, gpa_scale: 5 }).success).toBe(
      true,
    );
  });

  it("rejects a GPA above the selected scale", () => {
    const result = gpaStepSchema.safeParse({ gpa: 5.1, gpa_scale: 5 });
    expect(result.success).toBe(false);
  });

  it("rejects an unknown scale", () => {
    expect(gpaStepSchema.safeParse({ gpa: 3, gpa_scale: 6 }).success).toBe(
      false,
    );
  });

  it("accepts 4 / 10 / 100 scales at the top of the range", () => {
    expect(gpaStepSchema.safeParse({ gpa: 4, gpa_scale: 4 }).success).toBe(true);
    expect(gpaStepSchema.safeParse({ gpa: 10, gpa_scale: 10 }).success).toBe(
      true,
    );
    expect(gpaStepSchema.safeParse({ gpa: 100, gpa_scale: 100 }).success).toBe(
      true,
    );
  });
});

describe("statusStepSchema", () => {
  it("accepts a graduate with a school grade", () => {
    expect(
      statusStepSchema.safeParse({
        path: "graduate",
        grade_or_year: "11 класс",
      }).success,
    ).toBe(true);
  });

  it("rejects a graduate with a university year", () => {
    expect(
      statusStepSchema.safeParse({
        path: "graduate",
        grade_or_year: "1 курс",
      }).success,
    ).toBe(false);
  });
});
