import { getCountryLabel, type ProfileData } from "@/lib/profile/types";

/** Only real profile fields — used so the model can judge «мотивация и цель» against the applicant's own goals. */
export type EssayProfileFacts = {
  intendedMajor: string | null;
  targetCountries: string[];
  gradeOrYear: string | null;
  englishLevel: string | null;
  examsTaken: { code: string; score: string }[];
  activityTitles: string[];
};

export function essayProfileFacts(profile: ProfileData): EssayProfileFacts {
  return {
    intendedMajor: profile.intended_major,
    targetCountries: profile.target_countries,
    gradeOrYear: profile.grade_or_year,
    englishLevel: profile.english_level,
    examsTaken: profile.exams
      .filter((exam) => exam.status === "taken")
      .map((exam) => ({ code: exam.code, score: String(exam.score) })),
    activityTitles: profile.activities.map((activity) => activity.title.trim()).filter(Boolean),
  };
}

export function essayProfileFactsText(facts: EssayProfileFacts): string {
  const lines: string[] = [];
  if (facts.intendedMajor?.trim()) lines.push(`Специальность: ${facts.intendedMajor.trim()}`);
  if (facts.targetCountries.length) lines.push(`Страны: ${facts.targetCountries.map(getCountryLabel).join(", ")}`);
  if (facts.gradeOrYear) lines.push(`Класс/курс: ${facts.gradeOrYear}`);
  if (facts.englishLevel) lines.push(`Английский: ${facts.englishLevel}`);
  if (facts.examsTaken.length) {
    lines.push(`Экзамены: ${facts.examsTaken.map((exam) => `${exam.code} — ${exam.score}`).join(", ")}`);
  }
  if (facts.activityTitles.length) lines.push(`Активности: ${facts.activityTitles.join(", ")}`);
  return lines.length ? lines.join("\n") : "Профиль пока пустой.";
}
