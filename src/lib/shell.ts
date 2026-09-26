import { DEFAULT_NAV } from "@/components/pathway/shell/nav";
import type { ShellData } from "@/types/pathway";

const SOON = new Set(["favorites", "compare", "roadmap", "opportunities", "exams", "ai"]);

export function buildShellData(input: {
  name: string;
  city: string | null;
  email: string | null;
  shortlistCount: number | null;
}): ShellData {
  return {
    user: {
      name: input.name || input.email || "Профиль",
      city: input.city,
      email: input.email ?? undefined,
    },
    nav: DEFAULT_NAV.map((item) => ({
      ...item,
      soon: SOON.has(item.id) || undefined,
      badge: item.id === "favorites" && input.shortlistCount ? input.shortlistCount : undefined,
    })),
    mobileTabs: ["home", "unis", "roadmap", "ai", "profile"],
    streakDays: null,
    notifications: 0,
    guide: {
      title: "С чего начать?",
      text: "Профиль, резюме и вузы",
      cta: "К профилю",
      href: "/profile",
    },
  };
}
