import type { RoadmapTaskDraft } from "./build";

export type RoadmapExisting = {
  id: string;
  roadmapKey: string | null;
  source: "roadmap" | "agent" | "manual";
  status: "todo" | "in_progress" | "done";
  title: string;
  description: string | null;
  dueDate: string | null;
  relatedType: RoadmapTaskDraft["relatedType"];
  relatedId: string | null;
};

export type RoadmapUpdatePatch = {
  title: string;
  description: string;
  dueDate: string | null;
  relatedType: RoadmapTaskDraft["relatedType"];
  relatedId: string | null;
};

export type RoadmapStore = {
  list(): Promise<RoadmapExisting[]>;
  insert(task: RoadmapTaskDraft): Promise<void>;
  update(id: string, patch: RoadmapUpdatePatch): Promise<void>;
};

export type RoadmapSyncStats = {
  inserted: number;
  updated: number;
  unchanged: number;
};

function same(existing: RoadmapExisting, draft: RoadmapTaskDraft): boolean {
  return (
    existing.title === draft.title &&
    existing.description === draft.description &&
    existing.dueDate === draft.dueDate &&
    existing.relatedType === draft.relatedType &&
    existing.relatedId === draft.relatedId
  );
}

/**
 * Upsert by `roadmap_key`. Does not change `status`, does not write rows
 * whose source is manual or agent, and does not delete leftover keys.
 */
export async function applyRoadmapSync(
  store: RoadmapStore,
  plan: RoadmapTaskDraft[],
): Promise<RoadmapSyncStats> {
  const existing = await store.list();
  const byKey = new Map<string, RoadmapExisting>();
  for (const row of existing) {
    if (row.roadmapKey && row.source === "roadmap") {
      byKey.set(row.roadmapKey, row);
    }
  }

  const stats: RoadmapSyncStats = { inserted: 0, updated: 0, unchanged: 0 };
  for (const draft of plan) {
    const row = byKey.get(draft.roadmapKey);
    if (!row) {
      await store.insert(draft);
      stats.inserted += 1;
      continue;
    }
    if (same(row, draft)) {
      stats.unchanged += 1;
      continue;
    }
    await store.update(row.id, {
      title: draft.title,
      description: draft.description,
      dueDate: draft.dueDate,
      relatedType: draft.relatedType,
      relatedId: draft.relatedId,
    });
    stats.updated += 1;
  }
  return stats;
}
