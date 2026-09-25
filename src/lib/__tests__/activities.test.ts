import { describe, expect, it } from "vitest";

import { moveActivity } from "../profile/activities";

describe("moveActivity", () => {
  it("moves an item up and down", () => {
    expect(moveActivity(["a", "b", "c"], 1, "up")).toEqual(["b", "a", "c"]);
    expect(moveActivity(["a", "b", "c"], 1, "down")).toEqual(["a", "c", "b"]);
  });

  it("is a no-op at the edges", () => {
    const items = ["a", "b", "c"];
    expect(moveActivity(items, 0, "up")).toBe(items);
    expect(moveActivity(items, 2, "down")).toBe(items);
    expect(moveActivity(items, -1, "up")).toBe(items);
    expect(moveActivity(items, 9, "down")).toBe(items);
  });

  it("does not mutate the original array on a successful move", () => {
    const items = ["a", "b", "c"];
    const next = moveActivity(items, 0, "down");
    expect(next).toEqual(["b", "a", "c"]);
    expect(items).toEqual(["a", "b", "c"]);
  });
});
