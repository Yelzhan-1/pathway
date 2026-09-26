import { useEffect, useRef, useState } from "react";

type SaveStatus = "idle" | "saving" | "saved" | "error";

export function useAutosave<T>(
  value: T,
  save: (value: T) => Promise<{ error: string | null }>,
  delay = 1000,
): { status: SaveStatus; error: string | null } {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const saveRef = useRef(save);
  const first = useRef(true);
  const serialized = JSON.stringify(value);
  const serializedRef = useRef(serialized);
  const lastSavedRef = useRef(serialized);
  const timerRef = useRef<number | null>(null);
  const inFlightRef = useRef(false);
  const generationRef = useRef(0);
  const mountedRef = useRef(true);
  const flushRef = useRef<() => Promise<void>>(async () => {});
  const dirtyRef = useRef<() => boolean>(() => false);

  useEffect(() => {
    saveRef.current = save;
  }, [save]);

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
    dirtyRef.current = () =>
      timerRef.current != null ||
      inFlightRef.current ||
      serializedRef.current !== lastSavedRef.current;

    flushRef.current = async () => {
      if (timerRef.current != null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      if (inFlightRef.current) return;
      if (serializedRef.current === lastSavedRef.current) return;

      inFlightRef.current = true;
      const generation = ++generationRef.current;
      const payloadSerialized = serializedRef.current;
      if (mountedRef.current) setStatus("saving");

      try {
        const result = await saveRef.current(JSON.parse(payloadSerialized) as T);
        if (generation !== generationRef.current) return;

        if (result.error) {
          if (mountedRef.current && serializedRef.current === payloadSerialized) {
            setStatus("error");
            setError(result.error);
          }
          return;
        }

        if (serializedRef.current !== payloadSerialized) return;

        lastSavedRef.current = payloadSerialized;
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
      void flushRef.current();
    }
    function onVisibility() {
      if (document.visibilityState === "hidden") void flushRef.current();
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
      void flushRef.current();
    };
  }, []);

  return { status, error };
}
