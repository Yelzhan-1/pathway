import { useEffect, useRef, useState } from "react";

type SaveStatus = "idle" | "saving" | "saved" | "error";

export function useAutosave<T>(
  value: T,
  save: (value: T) => Promise<{ error: string | null }>,
  delay = 1000,
): { status: SaveStatus; error: string | null } {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const first = useRef(true);
  const saveRef = useRef(save);
  const serialized = JSON.stringify(value);

  useEffect(() => {
    saveRef.current = save;
  }, [save]);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }

    setStatus("saving");
    const handle = window.setTimeout(() => {
      void saveRef.current(JSON.parse(serialized) as T).then((result) => {
        if (result.error) {
          setStatus("error");
          setError(result.error);
          return;
        }
        setStatus("saved");
        setError(null);
      });
    }, delay);

    return () => window.clearTimeout(handle);
  }, [serialized, delay]);

  return { status, error };
}
