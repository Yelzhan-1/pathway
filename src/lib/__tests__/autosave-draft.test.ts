import { describe, expect, it } from "vitest";

import {
  clearUserDrafts,
  createMemoryStorage,
  draftAfterSanitizedSave,
  draftStorageKey,
  hasExpectedUpdatedAt,
  mergePatch,
  restoreDraft,
  saveWithConflictRetry,
  writePatchDraft,
} from "../hooks/autosave-patch";

describe("draft journal", () => {
  it("keeps an invalid link after the sanitized fields are saved", () => {
    const base = {
      contacts: { phone: "", links: [] as { label: string; url: string }[] },
    };
    const editor = {
      contacts: {
        phone: "1",
        links: [{ label: "Site", url: "not-a-url" }],
      },
    };
    const sanitized = {
      contacts: { phone: "1", links: [] as { label: string; url: string }[] },
    };

    expect(draftAfterSanitizedSave(base, editor, sanitized)).toEqual({
      contacts: { links: [{ label: "Site", url: "not-a-url" }] },
    });
  });

  it("does not restore fields a newer server save already changed", () => {
    const server = {
      education: { institution: "newer-school" },
      contacts: { phone: "" },
    };
    const restored = restoreDraft(server, "2026-09-26T00:00:05.000Z", {
      patch: {
        education: { institution: "typed-school" },
        contacts: { phone: "111" },
      },
      base: {
        education: { institution: "old-school" },
        contacts: { phone: "" },
      },
      baseUpdatedAt: "t0",
      clientSavedAt: 1_000,
    });

    expect(restored.value.education.institution).toBe("newer-school");
    expect(restored.value.contacts.phone).toBe("111");
  });

  it("drops a draft whose patch is already on the server", () => {
    const server = { contacts: { phone: "111" } };
    const restored = restoreDraft(server, "2026-09-26T00:00:05.000Z", {
      patch: { contacts: { phone: "111" } },
      base: { contacts: { phone: "" } },
      baseUpdatedAt: "t0",
      clientSavedAt: 1_000,
    });
    expect(restored.draft).toBeNull();
    expect(restored.value).toEqual(server);
  });
});

describe("409 conflict retry", () => {
  it("keeps A's school and B's phone", async () => {
    const patchB = { contacts: { phone: "777" } };
    const serverAfterA = {
      education: { institution: "School A" },
      contacts: { phone: "", city: "Алматы" },
    };
    const calls: unknown[] = [];

    const result = await saveWithConflictRetry(async (patch) => {
      calls.push(patch);
      if (calls.length === 1) {
        return {
          error: null,
          conflict: { serverValue: serverAfterA, updatedAt: "t2" },
        };
      }
      return { error: null, updatedAt: "t3" };
    }, patchB);

    expect(calls).toEqual([patchB, patchB]);
    const merged = mergePatch(serverAfterA, patchB);
    expect(merged.education.institution).toBe("School A");
    expect(merged.contacts.phone).toBe("777");
    expect(merged.contacts.city).toBe("Алматы");
    expect(result.error).toBeNull();
    expect(result.appliedOn).toEqual(serverAfterA);
  });
});

describe("sign-out drafts", () => {
  it("clears every draft key for that user", () => {
    const storage = createMemoryStorage();
    const cvKey = draftStorageKey("user-1", "cv");
    const activitiesKey = draftStorageKey("user-1", "activities");
    const otherKey = draftStorageKey("user-2", "cv");
    const entry = {
      patch: { contacts: { phone: "1" } },
      base: { contacts: { phone: "" } },
      baseUpdatedAt: "t0",
      clientSavedAt: 1,
    };
    writePatchDraft(storage, cvKey, entry);
    writePatchDraft(storage, activitiesKey, entry);
    writePatchDraft(storage, otherKey, entry);

    clearUserDrafts(storage, "user-1");

    expect(storage.getItem(cvKey)).toBeNull();
    expect(storage.getItem(activitiesKey)).toBeNull();
    expect(storage.getItem(otherKey)).not.toBeNull();
  });
});

describe("expectedUpdatedAt", () => {
  it("rejects a missing concurrency token", () => {
    expect(hasExpectedUpdatedAt(null)).toBe(false);
    expect(hasExpectedUpdatedAt("")).toBe(false);
    expect(hasExpectedUpdatedAt("2026-09-26T00:00:00.000Z")).toBe(true);
  });
});
