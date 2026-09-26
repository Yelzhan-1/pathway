import { useEffect, useRef, useState } from "react";

import { strings } from "@/lib/strings";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

const KEEPALIVE_LIMIT = 64 * 1024;
export const CONFLICT_RETRY_LIMIT = 3;

export type DraftStorage = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
};

export type DraftEntry<T> = {
  payload: T;
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

export function statusAfterSkippedSave(hasSaved: boolean): "idle" | "saved" {
  return hasSaved ? "saved" : "idle";
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
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function readDraft<T>(
  storage: DraftStorage,
  key: string,
): DraftEntry<T> | null {
  try {
    const raw = storage.getItem(key);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed) || typeof parsed.clientSavedAt !== "number") {
      return null;
    }
    if (!("payload" in parsed)) return null;
    return {
      payload: parsed.payload as T,
      clientSavedAt: parsed.clientSavedAt,
    };
  } catch {
    return null;
  }
}

export function writeDraft<T>(
  storage: DraftStorage,
  key: string,
  payload: T,
  now = Date.now(),
): void {
  try {
    storage.setItem(key, JSON.stringify({ payload, clientSavedAt: now }));
  } catch {
    // sessionStorage can be missing or quota-limited
  }
}

export function clearDraftIfPayload<T>(
  storage: DraftStorage,
  key: string,
  payload: T,
): void {
  const stored = readDraft<T>(storage, key);
  if (!stored) return;
  if (JSON.stringify(stored.payload) !== JSON.stringify(payload)) return;
  try {
    storage.removeItem(key);
  } catch {
    // ignore
  }
}

export function resolveRestoredValue<T>(
  serverValue: T,
  draft: DraftEntry<T> | null,
): T {
  return draft ? draft.payload : serverValue;
}

export function applyDraftOnTop<T>(serverValue: T, draft: T): T {
  if (isRecord(serverValue) && isRecord(draft)) {
    return { ...serverValue, ...draft } as T;
  }
  return draft;
}

export async function saveWithConflictRetry<T>(
  save: (value: T) => Promise<AutosaveWriteResult<T>>,
  value: T,
): Promise<{ error: string | null; updatedAt?: string; value: T }> {
  let current = value;
  for (let attempt = 0; attempt < CONFLICT_RETRY_LIMIT; attempt++) {
    const result = await save(current);
    if (result.conflict) {
      current = applyDraftOnTop(result.conflict.serverValue, current);
      continue;
    }
    return {
      error: result.error,
      updatedAt: result.updatedAt,
      value: current,
    };
  }
  return { error: strings.cv.saveError, value: current };
}

function getSessionDraftStorage(): DraftStorage | null {
  try {
    if (typeof sessionStorage === "undefined") return null;
    return sessionStorage;
  } catch {
    return null;
  }
}

type Keepalive = { url: string; kind: "cv" | "activities" };

type AutosaveOptions<T> = {
  delay?: number;
  keepalive?: Keepalive;
  prepare?: (value: T) => T;
  journal?: { userId: string; kind: "cv" | "activities" };
  onRestore?: (payload: T) => void;
  version?: {
    get: () => string | null;
    set: (value: string) => void;
  };
};

export function useAutosave<T>(
  value: T,
  save: (value: T) => Promise<AutosaveWriteResult<T>>,
  options: number | AutosaveOptions<T> = {},
): { status: SaveStatus; error: string | null } {
  const delay = typeof options === "number" ? options : (options.delay ?? 1000);
  const keepalive = typeof options === "number" ? undefined : options.keepalive;
  const prepare = typeof options === "number" ? undefined : options.prepare;
  const journal = typeof options === "number" ? undefined : options.journal;
  const onRestore = typeof options === "number" ? undefined : options.onRestore;
  const version = typeof options === "number" ? undefined : options.version;

  const [status, setStatus] = useState<SaveStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const saveRef = useRef(save);
  const prepareRef = useRef(prepare);
  const keepaliveRef = useRef(keepalive);
  const journalRef = useRef(journal);
  const onRestoreRef = useRef(onRestore);
  const versionRef = useRef(version);
  const first = useRef(true);
  const serialized = JSON.stringify(value);
  const serializedRef = useRef(serialized);
  const lastSavedRef = useRef(serialized);
  const timerRef = useRef<number | null>(null);
  const inFlightRef = useRef(false);
  const generationRef = useRef(0);
  const mountedRef = useRef(true);
  const hasSavedRef = useRef(false);
  const flushRef = useRef<() => Promise<void>>(async () => {});
  const dirtyRef = useRef<() => boolean>(() => false);
  const keepaliveSendRef = useRef<() => void>(() => {});
  const pendingImmediateRef = useRef(false);
  const restoredRef = useRef(false);

  useEffect(() => {
    saveRef.current = save;
    prepareRef.current = prepare;
    keepaliveRef.current = keepalive;
    journalRef.current = journal;
    onRestoreRef.current = onRestore;
    versionRef.current = version;
  }, [save, prepare, keepalive, journal, onRestore, version]);

  useEffect(() => {
    serializedRef.current = serialized;
  }, [serialized]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    function settle() {
      if (!mountedRef.current) return;
      setStatus(statusAfterSkippedSave(hasSavedRef.current));
      setError(null);
    }

    function isPending() {
      return (
        timerRef.current != null ||
        inFlightRef.current ||
        serializedRef.current !== lastSavedRef.current
      );
    }

    function journalStorageAndKey() {
      const config = journalRef.current;
      const storage = getSessionDraftStorage();
      if (!config || !storage) return null;
      return { storage, key: draftStorageKey(config.userId, config.kind) };
    }

    dirtyRef.current = isPending;

    keepaliveSendRef.current = () => {
      const config = keepaliveRef.current;
      if (!config || !isPending()) return;
      if (timerRef.current != null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      const raw = JSON.parse(serializedRef.current) as T;
      const outgoing = prepareRef.current ? prepareRef.current(raw) : raw;
      const body = JSON.stringify({
        kind: config.kind,
        data: outgoing,
        expectedUpdatedAt: versionRef.current?.get() ?? null,
      });
      if (body.length >= KEEPALIVE_LIMIT) return;
      void fetch(config.url, {
        method: "POST",
        keepalive: true,
        credentials: "same-origin",
        headers: { "content-type": "application/json" },
        body,
      });
    };

    flushRef.current = async () => {
      if (timerRef.current != null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      if (inFlightRef.current) {
        if (serializedRef.current === lastSavedRef.current) settle();
        return;
      }
      if (serializedRef.current === lastSavedRef.current) {
        settle();
        return;
      }

      inFlightRef.current = true;
      const generation = ++generationRef.current;
      const payloadSerialized = serializedRef.current;
      if (mountedRef.current) setStatus("saving");

      try {
        const raw = JSON.parse(payloadSerialized) as T;
        const result = await saveWithConflictRetry(async (current) => {
          const outgoing = prepareRef.current
            ? prepareRef.current(current)
            : current;
          const write = await saveRef.current(outgoing);
          if (write.updatedAt) versionRef.current?.set(write.updatedAt);
          if (write.conflict) {
            versionRef.current?.set(write.conflict.updatedAt);
          }
          return write;
        }, raw);

        if (generation !== generationRef.current) {
          if (serializedRef.current === lastSavedRef.current) settle();
          return;
        }

        if (result.error) {
          if (mountedRef.current && serializedRef.current === payloadSerialized) {
            setStatus("error");
            setError(result.error);
          } else if (serializedRef.current === lastSavedRef.current) {
            settle();
          }
          return;
        }

        if (serializedRef.current !== payloadSerialized) return;

        lastSavedRef.current = payloadSerialized;
        hasSavedRef.current = true;
        const journalTarget = journalStorageAndKey();
        if (journalTarget) {
          clearDraftIfPayload(
            journalTarget.storage,
            journalTarget.key,
            JSON.parse(payloadSerialized) as T,
          );
        }
        if (mountedRef.current) {
          setStatus("saved");
          setError(null);
        }
      } finally {
        const newer = serializedRef.current !== payloadSerialized;
        inFlightRef.current = false;
        if (generation === generationRef.current && newer) {
          void flushRef.current();
        }
      }
    };
  });

  useEffect(() => {
    if (first.current) {
      first.current = false;
      lastSavedRef.current = serialized;
      return;
    }

    const journalTarget = (() => {
      const config = journalRef.current;
      const storage = getSessionDraftStorage();
      if (!config || !storage) return null;
      return { storage, key: draftStorageKey(config.userId, config.kind) };
    })();

    if (serialized === lastSavedRef.current) {
      if (mountedRef.current) {
        setStatus(statusAfterSkippedSave(hasSavedRef.current));
        setError(null);
      }
      return;
    }

    if (journalTarget) {
      writeDraft(journalTarget.storage, journalTarget.key, JSON.parse(serialized) as T);
    }

    if (mountedRef.current) setStatus("saving");
    if (timerRef.current != null) window.clearTimeout(timerRef.current);
    if (pendingImmediateRef.current) {
      pendingImmediateRef.current = false;
      void flushRef.current();
      return;
    }
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      void flushRef.current();
    }, delay);

    return () => {
      if (timerRef.current != null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [serialized, delay]);

  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;
    const config = journalRef.current;
    const storage = getSessionDraftStorage();
    if (!config || !storage) return;
    const key = draftStorageKey(config.userId, config.kind);
    const draft = readDraft<T>(storage, key);
    if (!draft) return;
    if (JSON.stringify(draft.payload) === serializedRef.current) {
      clearDraftIfPayload(storage, key, draft.payload);
      return;
    }
    pendingImmediateRef.current = true;
    onRestoreRef.current?.(resolveRestoredValue(JSON.parse(serializedRef.current) as T, draft));
  }, []);

  useEffect(() => {
    function onPageHide() {
      keepaliveSendRef.current();
    }
    function onVisibility() {
      if (document.visibilityState === "hidden") keepaliveSendRef.current();
      else void flushRef.current();
    }
    function onBeforeUnload(event: BeforeUnloadEvent) {
      if (!dirtyRef.current()) return;
      event.preventDefault();
      event.returnValue = "";
    }
    window.addEventListener("pagehide", onPageHide);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      window.removeEventListener("pagehide", onPageHide);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("beforeunload", onBeforeUnload);
      if (keepaliveRef.current) keepaliveSendRef.current();
      else void flushRef.current();
    };
  }, []);

  return { status, error };
}
