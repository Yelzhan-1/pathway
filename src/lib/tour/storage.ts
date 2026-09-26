/** localStorage flag for the first-visit welcome tour — same pattern as feedback storage (namespaced key, try/catch for private mode, useSyncExternalStore-friendly). */
const TOUR_KEY = "pathway:tour:dismissed";
const STORE_EVENT = "pathway:tour:dismissed-changed";

/** Fired on `window` to reopen the tour from the «?» button in the shell. */
export const TOUR_REOPEN_EVENT = "pathway:tour:reopen";

export function readTourDismissed(): boolean {
  try {
    return window.localStorage.getItem(TOUR_KEY) === "1";
  } catch {
    return false;
  }
}

export function writeTourDismissed(): void {
  try {
    window.localStorage.setItem(TOUR_KEY, "1");
    window.dispatchEvent(new Event(STORE_EVENT));
  } catch {
    /* private mode — tour will just show again next visit */
  }
}

export function subscribeTourDismissed(onChange: () => void): () => void {
  window.addEventListener("storage", onChange);
  window.addEventListener(STORE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(STORE_EVENT, onChange);
  };
}

export function reopenTour(): void {
  window.dispatchEvent(new Event(TOUR_REOPEN_EVENT));
}
