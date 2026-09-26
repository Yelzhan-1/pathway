import type { FitCheckKey, FitGap } from "./types";

const PROFILE_STEPS: Record<FitCheckKey, { href: string; label_ru: string }> = {
  english: { href: "/profile#exams", label_ru: "Добавить английский в профиль" },
  unt: { href: "/profile#exams", label_ru: "Добавить ЕНТ в профиль" },
  sat: { href: "/profile#exams", label_ru: "Добавить SAT в профиль" },
  gpa: { href: "/profile#gpa", label_ru: "Добавить GPA" },
  budget: { href: "/profile#budget", label_ru: "Указать бюджет" },
  major: { href: "/profile#intended_major", label_ru: "Указать специальность" },
  country: { href: "/profile#target_countries", label_ru: "Указать страны" },
  deadline: { href: "/roadmap", label_ru: "Проверить срок на сайте вуза" },
};

const ACTION_STEPS: Record<FitCheckKey, { href: string; label_ru: string }> = {
  english: { href: "/exams", label_ru: "Открыть план по английскому" },
  unt: { href: "/exams", label_ru: "Открыть план по ЕНТ" },
  sat: { href: "/exams", label_ru: "Открыть план по SAT" },
  gpa: { href: "/profile#gpa", label_ru: "Обновить GPA" },
  budget: { href: "/profile#budget", label_ru: "Проверить бюджет и гранты" },
  major: { href: "/profile#intended_major", label_ru: "Уточнить специальность" },
  country: { href: "/profile#target_countries", label_ru: "Уточнить страны" },
  deadline: { href: "/roadmap", label_ru: "Проверить срок на сайте вуза" },
};

export function gapNextStep(gap: FitGap): { href: string; label_ru: string } {
  if (gap.message_ru.startsWith("добавьте")) return PROFILE_STEPS[gap.key];
  return ACTION_STEPS[gap.key];
}
