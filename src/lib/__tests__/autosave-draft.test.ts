import { describe, expect, it } from "vitest";

import {
  applyDraftOnTop,
  clearDraftIfPayload,
  createMemoryStorage,
  draftStorageKey,
  readDraft,
  resolveRestoredValue,
  saveWithConflictRetry,
  writeDraft,
} from "../hooks/use-autosave";
import { strings } from "../strings";

describe("draft journal", () => {
  it("prefers a restored draft over server props", () => {
    const server = { school: "old", phone: "111" };
    const draft = {
      payload: { school: "new", phone: "111" },
      clientSavedAt: 1,
    };
    expect(resolveRestoredValue(server, draft)).toEqual(draft.payload);
    expect(resolveRestoredValue(server, null)).toEqual(server);
  });

  it("writes a journal entry and clears it only for the exact payload", () => {
    const storage = createMemoryStorage();
    const key = draftStorageKey("user-1", "cv");
    writeDraft(storage, key, { school: "new" }, 42);

    const stored = readDraft<{ school: string }>(storage, key);
    expect(stored).toEqual({ payload: { school: "new" }, clientSavedAt: 42 });

    clearDraftIfPayload(storage, key, { school: "stale" });
    expect(readDraft(storage, key)?.payload).toEqual({ school: "new" });

    clearDraftIfPayload(storage, key, { school: "new" });
    expect(readDraft(storage, key)).toBeNull();
  });

  it("keeps an invalid link in the draft payload", () => {
    const storage = createMemoryStorage();
    const key = draftStorageKey("user-1", "cv");
    const payload = {
      contacts: { links: [{ label: "Site", url: "not-a-url" }] },
    };
    writeDraft(storage, key, payload, 7);
    expect(readDraft(storage, key)?.payload).toEqual(payload);
  });
});

describe("409 conflict retry", () => {
  it("re-applies the local draft on top of the fresh server value and retries", async () => {
    const draft = { school: "typed-school", phone: "222" };
    const server = { school: "keepalive-school", phone: "999" };
    const calls: typeof draft[] = [];
    let token = "t1";

    const result = await saveWithConflictRetry(async (value) => {
      calls.push(value);
      if (token === "t1") {
        token = "t2";
        return {
          error: null,
          conflict: { serverValue: server, updatedAt: "t2" },
        };
      }
      expect(token).toBe("t2");
      return { error: null, updatedAt: "t3" };
    }, draft);

    expect(calls).toHaveLength(2);
    expect(calls[1]).toEqual(applyDraftOnTop(server, draft));
    expect(calls[1]).toEqual(draft);
    expect(result.error).toBeNull();
    expect(result.updatedAt).toBe("t3");
  });

  it("returns a save error after too many 409s", async () => {
    const result = await saveWithConflictRetry(async (value) => {
      return {
        error: null,
        conflict: { serverValue: value, updatedAt: "t-next" },
      };
    }, { school: "x" });

    expect(result.error).toBe(strings.cv.saveError);
  });
});
