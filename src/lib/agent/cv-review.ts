import type { Cv } from "@/lib/profile/types";

export type CvReviewCheck = {
  key: string;
  ok: boolean;
  message_ru: string;
};

export function reviewCv(cv: Cv): { checks: CvReviewCheck[]; suggestions: string[] } {
  const checks: CvReviewCheck[] = [
    {
      key: "summary",
      ok: cv.summary.trim().length >= 40,
      message_ru: "Добавьте краткое описание хотя бы из 40 символов.",
    },
    {
      key: "skills",
      ok: cv.skills.filter((skill) => skill.trim()).length >= 3,
      message_ru: "Добавьте хотя бы три навыка.",
    },
    {
      key: "languages",
      ok: cv.languages.some((language) => language.name.trim()),
      message_ru: "Добавьте хотя бы один язык.",
    },
    {
      key: "phone",
      ok: Boolean(cv.contacts.phone.trim()),
      message_ru: "Добавьте телефон.",
    },
    {
      key: "city",
      ok: Boolean(cv.contacts.city.trim()),
      message_ru: "Добавьте город в контактах.",
    },
    {
      key: "education",
      ok: Boolean(cv.education.institution.trim()),
      message_ru: "Добавьте учебное заведение.",
    },
  ];
  return {
    checks,
    suggestions: checks.filter((item) => !item.ok).map((item) => item.message_ru),
  };
}
