import { useEffect, useRef, useState } from "react";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

const KEEPALIVE_LIMIT = 64 * 1024;

export function statusAfterSkippedSave(hasSaved: boolean): "idle" | "saved" {
  return hasSaved ? "saved" : "idle";
}

type Keepalive = { url: string; kind: "cv" | "activities" };

type AutosaveOptions<T> = {
  delay?: number;
  keepalive?: Keepalive;
  prepare?: (value: T) => T;
};

export function useAutosave<T>(
  value: T,
  save: (value: T) => Promise<{ error: string | null }>,
  options: number | AutosaveOptions<T> = {},
): { status: SaveStatus; error: string | null } {
  const delay = typeof options === "number" ? options : (options.delay ?? 1000);
  const keepalive = typeof options === "number" ? undefined : options.keepalive;
  const prepare = typeof options === "number" ? undefined : options.prepare;

  const [status, setStatus] = useState<SaveStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const saveRef = useRef(save);
  const prepareRef = useRef(prepare);
  const keepaliveRef = useRef(keepalive);
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

  useEffect(() => {
    saveRef.current = save;
    prepareRef.current = prepare;
    keepaliveRef.current = keepalive;
  }, [save, prepare, keepalive]);

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
      const body = JSON.stringify({ kind: config.kind, data: outgoing });
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
        const outgoing = prepareRef.current ? prepareRef.current(raw) : raw;
        const result = await saveRef.current(outgoing);
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

    if (serialized === lastSavedRef.current) {
      if (mountedRef.current) {
        setStatus(statusAfterSkippedSave(hasSavedRef.current));
        setError(null);
      }
      return;
    }

    if (mountedRef.current) setStatus("saving");
    if (timerRef.current != null) window.clearTimeout(timerRef.current);
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
