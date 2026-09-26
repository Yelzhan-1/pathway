import { DEFAULT_NAV } from "@/components/pathway/shell/nav";
import type { ShellData } from "@/types/pathway";

type NextStepCard = NonNullable<ShellData["guide"]>;

/**
 * Pure next-step card logic for the sidebar/«Ещё» sheet — replaces the old
 * static «С чего начать?» card. Returns null (hidden) once nothing is left
 * to nudge the user about, given the data we have. Unknown signals (null)
 * are skipped rather than assumed incomplete, so a missing query never
 * shows a wrong or scary card.
 */
export function nextStepCard(input: {
  profilePercent: number | null;
  profileFirstMissingHref: string | null;
  shortlistCount: number | null;
  cvPercent: number | null;
}): NextStepCard | null {
  const { profilePercent, profileFirstMissingHref, shortlistCount, cvPercent } = input;

  if (profilePercent != null && profilePercent < 100) {
    return {
      title: "Заполни профиль",
      text: `Осталось ${100 - profilePercent}% — это быстро`,
      cta: "Открыть профиль",
      href: profileFirstMissingHref ?? "/profile",
    };
  }
  if (shortlistCount === 0) {
    return {
      title: "Выбери вузы",
      text: "Собери список из каталога",
      cta: "Открыть вузы",
      href: "/universities",
    };
  }
  if (cvPercent != null && cvPercent < 100) {
    return {
      title: "Собери резюме",
      text: "Заполни несколько полей",
      cta: "Открыть документы",
      href: "/cv",
    };
  }
  return null;
}

export function buildShellData(input: {
  name: string;
  city: string | null;
  email: string | null;
  shortlistCount: number | null;
  freeOnly?: boolean;
  streakDays?: number | null;
  profilePercent?: number | null;
  profileFirstMissingHref?: string | null;
  cvPercent?: number | null;
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
    mobileTabs: ["home", "unis", "roadmap", "docs", "ai"],
    streakDays: input.streakDays ?? null,
    notifications: 0,
    freeOnly: input.freeOnly ?? false,
    guide: nextStepCard({
      profilePercent: input.profilePercent ?? null,
      profileFirstMissingHref: input.profileFirstMissingHref ?? null,
      shortlistCount: input.shortlistCount,
      cvPercent: input.cvPercent ?? null,
    }),
  };
}
