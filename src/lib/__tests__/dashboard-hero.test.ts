import { describe, expect, it } from "vitest";

import { heroCtaFor, presentWeekTasks, roadSteps } from "../dashboard/present";

describe("heroCtaFor", () => {
  it("points at the current road step, e.g. «Сейчас: экзамены → Открыть план подготовки»", () => {
    const road = roadSteps({ percent: 100, cvStarted: true, shortlistCount: 2 });
    const cta = heroCtaFor(road);
    expect(cta).toEqual({ current: "экзамены", cta: "Открыть план подготовки", href: "/exams" });
  });

  it("nudges towards the profile when nothing is done yet", () => {
    const road = roadSteps({ percent: 0, cvStarted: false, shortlistCount: null });
    const cta = heroCtaFor(road);
    expect(cta).toEqual({ current: "профиль", cta: "Заполнить профиль", href: "/profile" });
  });

  it("falls back to the roadmap when no step is current", () => {
    const cta = heroCtaFor([{ id: "apply", title: "Заявки", status: "done", href: "/roadmap" }]);
    expect(cta).toEqual({ current: null, cta: "Открыть план", href: "/roadmap" });
  });
});

describe("presentWeekTasks", () => {
  const today = "2026-09-23"; // Wednesday — week is 2026-09-21..2026-09-27

  it("puts overdue and this-week tasks first, sorted by date, and drops done tasks", () => {
    const tasks = presentWeekTasks(
      [
        { id: "future", title: "Далеко в будущем", status: "todo", due_date: "2026-10-05" },
        { id: "overdue", title: "Просрочено", status: "todo", due_date: "2026-09-20" },
        { id: "thisweek", title: "На этой неделе", status: "in_progress", due_date: "2026-09-25" },
        { id: "done", title: "Уже готово", status: "done", due_date: "2026-09-22" },
      ],
      today,
    );
    expect(tasks.map((t) => t.id)).toEqual(["overdue", "thisweek", "future"]);
    expect(tasks.every((t) => t.done === false)).toBe(true);
  });

  it("caps the list at 3 items", () => {
    const tasks = presentWeekTasks(
      Array.from({ length: 5 }, (_, i) => ({ id: `t${i}`, title: `Task ${i}`, status: "todo", due_date: "2026-09-24" })),
      today,
    );
    expect(tasks).toHaveLength(3);
  });

  it("returns an empty list when there are no open tasks", () => {
    expect(presentWeekTasks([], today)).toEqual([]);
    expect(presentWeekTasks([{ id: "d", title: "Done", status: "done", due_date: "2026-09-22" }], today)).toEqual([]);
  });
});
