/**
 * Returns a new array with the item at `index` swapped one slot toward
 * `direction`. Out-of-range moves are no-ops and return the original array.
 */
export function moveActivity<T>(
  items: readonly T[],
  index: number,
  direction: "up" | "down",
): T[] {
  const target = direction === "up" ? index - 1 : index + 1;
  if (
    index < 0 ||
    index >= items.length ||
    target < 0 ||
    target >= items.length
  ) {
    return items as T[];
  }

  const next = items.slice();
  const current = next[index];
  const swapped = next[target];
  if (current === undefined || swapped === undefined) {
    return items as T[];
  }
  next[index] = swapped;
  next[target] = current;
  return next;
}

export function newActivityId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `act_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}
