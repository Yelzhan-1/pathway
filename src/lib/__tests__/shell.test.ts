import { describe, expect, it } from "vitest";

import { DEFAULT_NAV } from "@/components/pathway/shell/nav";
import { buildShellData } from "@/lib/shell";

describe("buildShellData", () => {
  it("exposes live routes without soon chips and keeps the free-only flag", () => {
    const data = buildShellData({
      name: "Aida",
      city: "Almaty",
      email: "aida@example.com",
      shortlistCount: 2,
      freeOnly: true,
      streakDays: 3,
    });
    expect(data.freeOnly).toBe(true);
    expect(data.streakDays).toBe(3);
    expect(data.nav.every((item) => !item.soon)).toBe(true);
    expect(data.nav.map((item) => item.id)).toEqual(DEFAULT_NAV.map((item) => item.id));
    expect(data.nav.some((item) => item.id === "tasks")).toBe(true);
    expect(data.nav.some((item) => item.id === "mentors")).toBe(true);
    expect(data.nav.some((item) => item.id === "impact")).toBe(true);
    expect(data.nav.find((item) => item.id === "favorites")?.badge).toBe(2);
  });
});
