import { describe, expect, it } from "vitest";

import type { FitProfile, FitUniversity } from "@/lib/matching/types";
import { buildRoadmap } from "@/lib/roadmap/build";
import {
  applyRoadmapSync,
  type RoadmapExisting,
  type RoadmapStore,
  type RoadmapUpdatePatch,
} from "@/lib/roadmap/sync";

const TODAY = "2026-09-01";

function university(overrides: Partial<FitUniversity> = {}): FitUniversity {
  return {
    id: "uni-1",
    slug: "uni",
    name: "Uni",
    country: "USA",
    city: null,
    region: "usa",
    majors: null,
    requirements: null,
    deadlines: [{ round: "Regular", date: "2026-11-01", note: null }],
    tuition_usd_per_year: null,
    aid_for_internationals: null,
    scholarships: null,
    acceptance_rate: null,
    source_url: "https://uni.edu/apply",
    ielts_min: 6.5,
    toefl_min: null,
    duolingo_min: null,
    unt_min: null,
    sat_policy: null,
    sat_total_min: null,
    sat_total_max: null,
    ...overrides,
  };
}

function memoryStore(initial: RoadmapExisting[] = []) {
  const tasks = initial.map((task) => ({ ...task }));
  const inserts: string[] = [];
  const updates: Array<{ id: string; patch: RoadmapUpdatePatch }> = [];
  const store: RoadmapStore = {
    async list() {
      return tasks.map((task) => ({ ...task }));
    },
    async insert(task) {
      inserts.push(task.roadmapKey);
      tasks.push({
        id: `new-${tasks.length}`,
        roadmapKey: task.roadmapKey,
        source: "roadmap",
        status: "todo",
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        relatedType: task.relatedType,
        relatedId: task.relatedId,
      });
    },
    async update(id, patch) {
      updates.push({ id, patch });
      const row = tasks.find((task) => task.id === id);
      if (!row) return;
      row.title = patch.title;
      row.description = patch.description;
      row.dueDate = patch.dueDate;
      row.relatedType = patch.relatedType;
      row.relatedId = patch.relatedId;
    },
  };
  return { tasks, inserts, updates, store };
}

describe("roadmap sync", () => {
  it("inserts once, keeps status, and leaves manual tasks alone", async () => {
    const plan = buildRoadmap([university()], [], TODAY);
    expect(plan.map((task) => task.roadmapKey)).toContain("doc:cv");
    expect(plan.map((task) => task.roadmapKey)).toContain("exam-register:IELTS");
    expect(plan.find((task) => task.roadmapKey.startsWith("apply:"))?.dueDate).toBe("2026-11-01");

    const manual: RoadmapExisting = {
      id: "manual-1",
      roadmapKey: null,
      source: "manual",
      status: "in_progress",
      title: "Своя задача",
      description: null,
      dueDate: null,
      relatedType: null,
      relatedId: null,
    };
    const memory = memoryStore([manual]);
    const first = await applyRoadmapSync(memory.store, plan);
    expect(first.inserted).toBe(plan.length);
    const second = await applyRoadmapSync(memory.store, plan);
    expect(second.inserted).toBe(0);
    expect(second.updated).toBe(0);
    expect(memory.inserts).toHaveLength(plan.length);
    expect(memory.tasks.find((task) => task.id === "manual-1")).toMatchObject({
      status: "in_progress",
      title: "Своя задача",
    });

    const roadmapRow = memory.tasks.find((task) => task.roadmapKey === "doc:cv");
    expect(roadmapRow).toBeTruthy();
    roadmapRow!.status = "done";
    const changed = plan.map((task) =>
      task.roadmapKey === "doc:cv" ? { ...task, dueDate: "2026-10-01" } : task,
    );
    const third = await applyRoadmapSync(memory.store, changed);
    expect(third.updated).toBe(1);
    expect(memory.tasks.find((task) => task.roadmapKey === "doc:cv")?.status).toBe("done");
    expect(memory.updates[0]?.patch).not.toHaveProperty("status");
  });

  it("flags a last-cycle application date and does not set it as due", () => {
    const plan = buildRoadmap(
      [
        university({
          deadlines: [{ round: "RD", date: "2025-11-01", note: "last cycle (2025-26), verify" }],
        }),
      ],
      [],
      TODAY,
    );
    const application = plan.find((task) => task.roadmapKey.startsWith("apply:"));
    expect(application?.lastCycle).toBe(true);
    expect(application?.dueDate).toBeNull();
    expect(application?.description).toContain("по прошлому циклу — проверьте на сайте вуза");
    expect(application?.description).toContain("https://uni.edu/apply");
  });

  it("skips a met exam and never creates an already overdue due date", () => {
    const profile: FitProfile = {
      target_countries: [],
      intended_major: null,
      budget_usd: null,
      needs_scholarship: false,
      gpa: null,
      gpa_scale: null,
      exams: [{ code: "IELTS", score: 7, status: "taken" }],
    };
    const plan = buildRoadmap(
      [
        university({
          ielts_min: 6.5,
          deadlines: [{ round: "RD", date: "2026-09-10", note: null }],
        }),
      ],
      [],
      TODAY,
      profile,
    );
    expect(plan.some((task) => task.roadmapKey === "exam-register:IELTS")).toBe(false);
    expect(plan.every((task) => task.dueDate == null || task.dueDate >= TODAY)).toBe(true);
  });
});
