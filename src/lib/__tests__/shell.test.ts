import { describe, expect, it } from "vitest";

import { DEFAULT_NAV, MOBILE_TABS } from "@/components/pathway/shell/nav";
import { buildShellData, nextStepCard } from "@/lib/shell";

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
    expect(data.nav.some((item) => item.id === "whatif")).toBe(true);
    expect(data.nav.find((item) => item.id === "favorites")?.badge).toBe(2);
  });

  it("never lists profile or impact in the nav (profile lives in the account menu; impact is hidden from students)", () => {
    const data = buildShellData({ name: "Aida", city: null, email: null, shortlistCount: 0 });
    expect(data.nav.some((item) => item.id === "profile")).toBe(false);
    expect(data.nav.some((item) => item.id === "impact")).toBe(false);
  });

  it("keeps exactly the 5 spec'd main tabs (also used as the mobile bottom bar)", () => {
    expect(MOBILE_TABS.map((t) => t.id)).toEqual(["home", "unis", "roadmap", "docs", "ai"]);
  });

  it("hides the next-step card once profile, shortlist and CV are all in good shape", () => {
    const data = buildShellData({
      name: "Aida",
      city: "Almaty",
      email: null,
      shortlistCount: 2,
      profilePercent: 100,
      cvPercent: 100,
    });
    expect(data.guide).toBeNull();
  });
});

describe("nextStepCard", () => {
  const base = { profilePercent: 100 as number | null, profileFirstMissingHref: null, shortlistCount: 2 as number | null, cvPercent: 100 as number | null };

  it("prioritises finishing the profile first", () => {
    const card = nextStepCard({ ...base, profilePercent: 60, profileFirstMissingHref: "/profile#gpa" });
    expect(card).toEqual({
      title: "Заполни профиль",
      text: "Осталось 40% — это быстро",
      cta: "Открыть профиль",
      href: "/profile#gpa",
    });
  });

  it("nudges towards the catalog once the profile is done but the shortlist is empty", () => {
    const card = nextStepCard({ ...base, shortlistCount: 0 });
    expect(card?.href).toBe("/universities");
  });

  it("nudges towards the CV once profile and shortlist are done", () => {
    const card = nextStepCard({ ...base, cvPercent: 40 });
    expect(card?.href).toBe("/cv");
  });

  it("returns null when everything is done", () => {
    expect(nextStepCard(base)).toBeNull();
  });

  it("skips unknown (null) signals instead of assuming they are incomplete", () => {
    const card = nextStepCard({ profilePercent: null, profileFirstMissingHref: null, shortlistCount: null, cvPercent: null });
    expect(card).toBeNull();
  });
});
