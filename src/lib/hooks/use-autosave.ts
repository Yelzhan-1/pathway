import { useEffect, useRef, useState } from "react";

import {
  diffPatch,
  draftStorageKey,
  hasExpectedUpdatedAt,
  mergePatch,
  pickBase,
  readPatchDraft,
  restoreDraft,
  saveWithConflictRetry,
  writePatchDraft,
  type AutosaveWriteResult,
  type DraftStorage,
  type PatchDraft,
} from "@/lib/hooks/autosave-patch";

export type { AutosaveWriteResult, DraftStorage, PatchDraft };
export {
  clearUserDrafts,
  createMemoryStorage,
  diffPatch,
  draftAfterSanitizedSave,
  draftStorageKey,
  hasExpectedUpdatedAt,
  mergePatch,
  readPatchDraft,
  restoreDraft,
  saveWithConflictRetry,
  writePatchDraft,
} from "@/lib/hooks/autosave-patch";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

const KEEPALIVE_LIMIT = 64 * 1024;

export function statusAfterSkippedSave(hasSaved: boolean): "idle" | "saved" {
  return hasSaved ? "saved" : "idle";
}

function getSessionDraftStorage(): DraftStorage | null {
  try {
    if (typeof sessionStorage === "undefined") return null;
    return {
      getItem: (key) => sessionStorage.getItem(key),
      setItem: (key, value) => sessionStorage.setItem(key, value),
      removeItem: (key) => sessionStorage.removeItem(key),
      keys: () => {
        const names: string[] = [];
        for (let index = 0; index < sessionStorage.length; index += 1) {
          const key = sessionStorage.key(index);
          if (key) names.push(key);
        }
        return names;
      },
    };
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
  save: (patch: unknown) => Promise<AutosaveWriteResult<T>>,
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
  const baseRef = useRef<T>(value);
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

    function journalTarget() {
      const config = journalRef.current;
      const storage = getSessionDraftStorage();
      if (!config || !storage) return null;
      return { storage, key: draftStorageKey(config.userId, config.kind) };
    }

    function syncJournal(base: T, editor: T) {
      const target = journalTarget();
      if (!target) return;
      const remaining = diffPatch(base, editor);
      if (remaining === undefined) {
        target.storage.removeItem(target.key);
        return;
      }
      writePatchDraft(target.storage, target.key, {
        patch: remaining,
        base: pickBase(base, remaining),
        baseUpdatedAt: versionRef.current?.get() ?? null,
        clientSavedAt: Date.now(),
      });
    }

    function isPending() {
      return (
        timerRef.current != null ||
        inFlightRef.current ||
        serializedRef.current !== lastSavedRef.current
      );
    }

    dirtyRef.current = isPending;

    keepaliveSendRef.current = () => {
      const config = keepaliveRef.current;
      const expectedUpdatedAt = versionRef.current?.get() ?? null;
      if (!config || !isPending() || !hasExpectedUpdatedAt(expectedUpdatedAt)) return;
      if (timerRef.current != null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      const raw = JSON.parse(serializedRef.current) as T;
      const outgoing = prepareRef.current ? prepareRef.current(raw) : raw;
      const patch = diffPatch(baseRef.current, outgoing);
      if (patch === undefined) return;
      const body = JSON.stringify({
        kind: config.kind,
        data: patch,
        expectedUpdatedAt,
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
        const prepared = prepareRef.current ? prepareRef.current(raw) : raw;
        const baseAtSave = baseRef.current;
        const serverPatch = diffPatch(baseAtSave, prepared);

        if (serverPatch === undefined) {
          syncJournal(baseAtSave, raw);
          lastSavedRef.current = payloadSerialized;
          settle();
          return;
        }

        const result = await saveWithConflictRetry(async (patch) => {
          const write = await saveRef.current(patch);
          if (write.updatedAt) versionRef.current?.set(write.updatedAt);
          if (write.conflict) versionRef.current?.set(write.conflict.updatedAt);
          return write;
        }, serverPatch);

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

        const appliedOn = result.appliedOn ?? baseAtSave;
        const latest = JSON.parse(serializedRef.current) as T;
        const changes = diffPatch(baseAtSave, latest);
        const editor = result.appliedOn
          ? mergePatch(result.appliedOn, changes ?? latest)
          : latest;
        baseRef.current = mergePatch(appliedOn, serverPatch);
        syncJournal(baseRef.current, editor);
        lastSavedRef.current = JSON.stringify(editor);
        hasSavedRef.current = true;
        if (
          result.appliedOn &&
          JSON.stringify(editor) !== JSON.stringify(latest)
        ) {
          onRestoreRef.current?.(editor);
        }
        if (mountedRef.current && serializedRef.current === payloadSerialized) {
          setStatus("saved");
          setError(null);
        } else if (serializedRef.current === lastSavedRef.current) {
          settle();
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
      baseRef.current = JSON.parse(serialized) as T;
      return;
    }

    const target = (() => {
      const config = journalRef.current;
      const storage = getSessionDraftStorage();
      if (!config || !storage) return null;
      return { storage, key: draftStorageKey(config.userId, config.kind) };
    })();
    const raw = JSON.parse(serialized) as T;
    const editorPatch = diffPatch(baseRef.current, raw);
    if (target) {
      if (editorPatch === undefined) target.storage.removeItem(target.key);
      else {
        writePatchDraft(target.storage, target.key, {
          patch: editorPatch,
          base: pickBase(baseRef.current, editorPatch),
          baseUpdatedAt: versionRef.current?.get() ?? null,
          clientSavedAt: Date.now(),
        });
      }
    }

    if (serialized === lastSavedRef.current) {
      if (mountedRef.current) {
        setStatus(statusAfterSkippedSave(hasSavedRef.current));
        setError(null);
      }
      return;
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
    const draft = readPatchDraft(storage, key);
    if (!draft) return;
    const server = JSON.parse(serializedRef.current) as T;
    const restored = restoreDraft(
      server,
      versionRef.current?.get() ?? null,
      draft,
    );
    if (!restored.draft) {
      storage.removeItem(key);
      return;
    }
    writePatchDraft(storage, key, restored.draft);
    if (JSON.stringify(restored.value) === serializedRef.current) return;
    pendingImmediateRef.current = true;
    onRestoreRef.current?.(restored.value);
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
