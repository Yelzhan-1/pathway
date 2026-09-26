import { describe, expect, it } from "vitest";

import { emptyProfile } from "@/lib/profile/types";
import {
  buildProgress,
  computeReadiness,
  computeStreak,
  deriveAchievements,
  weeklyGoalProgress,
} from "@/lib/progress/readiness";

describe("progress", () => {
  it("returns null readiness when every part is missing", () => {
    const readiness = computeReadiness({
      profile: null,
      exams: null,
      shortlist: null,
      roadmap: null,
      cv: null,
    });
    expect(readiness.percent).toBeNull();
  });

  it("weights only the parts that exist", () => {
    const readiness = computeReadiness({
      profile: 100,
      exams: null,
      shortlist: 0,
      roadmap: null,
      cv: null,
    });
    expect(readiness.percent).toBe(Math.round((100 * 25) / 45));
  });

  it("counts a streak through today and breaks when the last day is older", () => {
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(Date.UTC(2026, 8, 26 - index));
      return date.toISOString().slice(0, 10);
    });
    expect(computeStreak(days, "2026-09-26")).toBe(7);
    expect(computeStreak(days.slice(1), "2026-09-26")).toBe(6);
    expect(computeStreak([], "2026-09-26")).toBe(0);
    expect(computeStreak(null, "2026-09-26")).toBeNull();
  });

  it("derives achievements from real counts", () => {
    const locked = deriveAchievements({
      shortlistCount: 0,
      profilePercent: 40,
      tasksDone: 0,
      streak: 1,
    });
    expect(locked.every((item) => !item.unlocked)).toBe(true);
    const unlocked = deriveAchievements({
      shortlistCount: 1,
      profilePercent: 100,
      tasksDone: 1,
      streak: 7,
    });
    expect(unlocked.every((item) => item.unlocked)).toBe(true);
  });

  it("compares tasks due this week with a null goal", () => {
    const goal = weeklyGoalProgress(
      [
        { due_date: "2026-09-22", status: "todo", source: "manual" },
        { due_date: "2026-09-26", status: "done", source: "roadmap" },
        { due_date: "2026-10-01", status: "done", source: "manual" },
      ],
      "2026-09-26",
      null,
    );
    expect(goal).toEqual({ goal: null, due: 2, done: 1 });
  });

  it("does not invent a streak or exam percent for an empty profile", () => {
    const report = buildProgress({
      profile: emptyProfile(),
      prep: { exams: [], kind: "template" },
      shortlistCount: 0,
      tasks: [],
      activityDays: [],
      weeklyGoal: null,
      today: "2026-09-26",
    });
    expect(report.streak).toBe(0);
    expect(report.readiness.parts.exams.percent).toBeNull();
    expect(report.readiness.parts.roadmap.percent).toBeNull();
    expect(report.achievements.find((item) => item.id === "first_shortlist")?.unlocked).toBe(false);
    expect(report.weeklySummary.weekStart).toBe("2026-09-21");
  });
});
