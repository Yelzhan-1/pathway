import { strings } from "@/lib/strings";

const NESTED = new Set(["contacts", "education"]);

export type DraftStorage = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
  keys: () => string[];
};

export type PatchDraft = {
  patch: unknown;
  base: unknown;
  baseUpdatedAt: string | null;
  clientSavedAt: number;
};

export type AutosaveWriteResult<T> = {
  error: string | null;
  updatedAt?: string;
  conflict?: {
    serverValue: T;
    updatedAt: string;
  };
};

export function hasExpectedUpdatedAt(
  value: string | null | undefined,
): value is string {
  return typeof value === "string" && value.length > 0;
}

export function draftStorageKey(userId: string, kind: string): string {
  return `pathway:cv-draft:${userId}:${kind}`;
}

export function createMemoryStorage(): DraftStorage {
  const map = new Map<string, string>();
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => {
      map.set(key, value);
    },
    removeItem: (key) => {
      map.delete(key);
    },
    keys: () => [...map.keys()],
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function jsonEq(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

export function diffPatch(base: unknown, next: unknown): unknown | undefined {
  if (isRecord(base) && isRecord(next)) {
    const patch: Record<string, unknown> = {};
    const keys = new Set([...Object.keys(base), ...Object.keys(next)]);
    for (const key of keys) {
      const current = base[key];
      const incoming = next[key];
      if (NESTED.has(key) && isRecord(current) && isRecord(incoming)) {
        const sub = diffPatch(current, incoming);
        if (isRecord(sub) && Object.keys(sub).length > 0) patch[key] = sub;
        continue;
      }
      if (!jsonEq(current, incoming)) patch[key] = incoming;
    }
    return Object.keys(patch).length > 0 ? patch : undefined;
  }
  return jsonEq(base, next) ? undefined : next;
}

export function mergePatch<T>(server: T, patch: unknown): T {
  if (!isRecord(server) || !isRecord(patch)) return patch as T;
  const next: Record<string, unknown> = { ...server };
  for (const key of Object.keys(patch)) {
    const value = patch[key];
    if (NESTED.has(key) && isRecord(value) && isRecord(next[key])) {
      next[key] = { ...(next[key] as Record<string, unknown>), ...value };
    } else {
      next[key] = value;
    }
  }
  return next as T;
}

export function pickBase(base: unknown, patch: unknown): unknown {
  if (!isRecord(patch)) return base;
  if (!isRecord(base)) return {};
  const picked: Record<string, unknown> = {};
  for (const key of Object.keys(patch)) {
    const sub = patch[key];
    if (NESTED.has(key) && isRecord(sub)) {
      picked[key] = pickBase(base[key], sub);
    } else {
      picked[key] = base[key];
    }
  }
  return picked;
}

export function serverContainsPatch(server: unknown, patch: unknown): boolean {
  if (!isRecord(patch)) return jsonEq(server, patch);
  if (!isRecord(server)) return false;
  for (const key of Object.keys(patch)) {
    const sub = patch[key];
    if (NESTED.has(key) && isRecord(sub)) {
      if (!serverContainsPatch(server[key], sub)) return false;
    } else if (!jsonEq(server[key], sub)) {
      return false;
    }
  }
  return true;
}

export function isServerNewerThan(
  serverUpdatedAt: string | null,
  clientSavedAt: number,
): boolean {
  if (!serverUpdatedAt) return false;
  const normalized = serverUpdatedAt.includes("T")
    ? serverUpdatedAt
    : serverUpdatedAt.replace(" ", "T");
  const ms = Date.parse(normalized);
  if (Number.isNaN(ms)) return false;
  return ms > clientSavedAt;
}

function filterWhereBaseMatches(
  server: unknown,
  base: unknown,
  patch: unknown,
): unknown | undefined {
  if (isRecord(patch) && isRecord(server) && isRecord(base)) {
    const kept: Record<string, unknown> = {};
    for (const key of Object.keys(patch)) {
      const sub = patch[key];
      if (NESTED.has(key) && isRecord(sub)) {
        const nested = filterWhereBaseMatches(server[key], base[key], sub);
        if (isRecord(nested) && Object.keys(nested).length > 0) kept[key] = nested;
        continue;
      }
      if (jsonEq(server[key], base[key])) kept[key] = sub;
    }
    return Object.keys(kept).length > 0 ? kept : undefined;
  }
  return jsonEq(server, base) ? patch : undefined;
}

export function readPatchDraft(
  storage: DraftStorage,
  key: string,
): PatchDraft | null {
  try {
    const raw = storage.getItem(key);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (
      !isRecord(parsed) ||
      !("patch" in parsed) ||
      !("base" in parsed) ||
      typeof parsed.clientSavedAt !== "number"
    ) {
      storage.removeItem(key);
      return null;
    }
    return {
      patch: parsed.patch,
      base: parsed.base,
      baseUpdatedAt:
        typeof parsed.baseUpdatedAt === "string" ? parsed.baseUpdatedAt : null,
      clientSavedAt: parsed.clientSavedAt,
    };
  } catch {
    return null;
  }
}

export function writePatchDraft(
  storage: DraftStorage,
  key: string,
  draft: PatchDraft,
): void {
  try {
    storage.setItem(key, JSON.stringify(draft));
  } catch {
    // sessionStorage can be missing or quota-limited
  }
}

export function clearUserDrafts(storage: DraftStorage, userId: string): void {
  const prefix = `pathway:cv-draft:${userId}:`;
  for (const key of storage.keys()) {
    if (key.startsWith(prefix)) storage.removeItem(key);
  }
}

export function clearBrowserCvDrafts(userId: string): void {
  try {
    if (typeof sessionStorage === "undefined") return;
    const keys: string[] = [];
    for (let index = 0; index < sessionStorage.length; index += 1) {
      const key = sessionStorage.key(index);
      if (key) keys.push(key);
    }
    clearUserDrafts(
      {
        getItem: (key) => sessionStorage.getItem(key),
        setItem: (key, value) => sessionStorage.setItem(key, value),
        removeItem: (key) => sessionStorage.removeItem(key),
        keys: () => keys,
      },
      userId,
    );
  } catch {
    // ignore
  }
}

export function restoreDraft<T>(
  server: T,
  serverUpdatedAt: string | null,
  draft: PatchDraft | null,
): { value: T; draft: PatchDraft | null } {
  if (!draft) return { value: server, draft: null };
  if (serverContainsPatch(server, draft.patch)) {
    return { value: server, draft: null };
  }
  const patch = isServerNewerThan(serverUpdatedAt, draft.clientSavedAt)
    ? filterWhereBaseMatches(server, draft.base, draft.patch)
    : draft.patch;
  if (patch === undefined || (isRecord(patch) && Object.keys(patch).length === 0)) {
    return { value: server, draft: null };
  }
  return {
    value: mergePatch(server, patch),
    draft: { ...draft, patch },
  };
}

export function draftAfterSanitizedSave(
  base: unknown,
  editor: unknown,
  sanitized: unknown,
): unknown | undefined {
  const saved = diffPatch(base, sanitized);
  const nextBase = saved === undefined ? base : mergePatch(base, saved);
  return diffPatch(nextBase, editor);
}

export async function saveWithConflictRetry<T>(
  save: (patch: unknown) => Promise<AutosaveWriteResult<T>>,
  patch: unknown,
): Promise<{ error: string | null; updatedAt?: string; appliedOn?: T }> {
  const first = await save(patch);
  if (first.error) return { error: first.error };
  if (!first.conflict) return { error: null, updatedAt: first.updatedAt };

  const second = await save(patch);
  if (second.error) return { error: second.error };
  if (second.conflict) return { error: strings.cv.saveError };
  return {
    error: null,
    updatedAt: second.updatedAt,
    appliedOn: first.conflict.serverValue,
  };
}
