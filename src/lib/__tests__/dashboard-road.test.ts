import { describe, expect, it } from "vitest";

import { roadSteps } from "../dashboard/present";

describe("roadSteps", () => {
  it("keeps the profile as the current step until it reaches 80%", () => {
    const steps = roadSteps({ percent: 40, cvStarted: false, shortlistCount: 0 });
    expect(steps.map((step) => step.status)).toEqual([
      "current",
      "locked",
      "locked",
      "locked",
      "locked",
    ]);
  });

  it("moves to the CV when the profile is done and the CV is empty", () => {
    const steps = roadSteps({ percent: 80, cvStarted: false, shortlistCount: 0 });
    expect(steps.find((step) => step.id === "cv")?.status).toBe("current");
    expect(steps.find((step) => step.id === "unis")?.status).toBe("locked");
  });

  it("makes «Выбери вузы» current when the shortlist is empty", () => {
    const steps = roadSteps({ percent: 100, cvStarted: true, shortlistCount: 0 });
    expect(steps.find((step) => step.id === "unis")).toMatchObject({
      title: "Выбери вузы",
      status: "current",
    });
  });

  it("marks «Выбери вузы» done when the shortlist has rows even if CV is empty", () => {
    const steps = roadSteps({ percent: 40, cvStarted: false, shortlistCount: 1 });
    expect(steps.find((step) => step.id === "unis")?.status).toBe("done");
  });

  it("marks «Выбери вузы» done when the shortlist has rows", () => {
    const steps = roadSteps({ percent: 100, cvStarted: true, shortlistCount: 2 });
    expect(steps.find((step) => step.id === "unis")?.status).toBe("done");
    expect(steps.find((step) => step.id === "exams")?.status).toBe("current");
  });
});
