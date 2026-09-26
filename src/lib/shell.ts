import { DEFAULT_NAV } from "@/components/pathway/shell/nav";
import type { ShellData } from "@/types/pathway";

export function buildShellData(input: {
  name: string;
  city: string | null;
  email: string | null;
  shortlistCount: number | null;
  freeOnly?: boolean;
  streakDays?: number | null;
}): ShellData {
  return {
    user: {
      name: input.name || input.email || "Профиль",
      city: input.city,
      email: input.email ?? undefined,
    },
    nav: DEFAULT_NAV.map((item) => ({
      ...item,
      badge: item.id === "favorites" && input.shortlistCount ? input.shortlistCount : undefined,
    })),
    mobileTabs: ["home", "unis", "roadmap", "ai", "profile"],
    streakDays: input.streakDays ?? null,
    notifications: 0,
    freeOnly: input.freeOnly ?? false,
    guide: {
      title: "С чего начать?",
      text: "Профиль, резюме и вузы",
      cta: "К профилю",
      href: "/profile",
    },
  };
}
