import { formatExamEntry } from "@/lib/profile/labels";
import { strings } from "@/lib/strings";
import type { Activity, Cv, ExamEntry, ProfileData } from "@/lib/profile/types";
import { isSafeHttpUrl } from "@/lib/profile/url";

export function cvHeading(
  lang: Cv["headingsLang"],
  key: keyof typeof strings.cv.sections,
): string {
  return lang === "en" ? strings.cv.headingsEnLabels[key] : strings.cv.sections[key];
}

export function CvDocument({
  fullName,
  email,
  profile,
  cv,
  exams,
  activities,
  showPlannedExams = false,
}: {
  fullName: string;
  email: string;
  profile: ProfileData;
  cv: Cv;
  exams: ExamEntry[];
  activities: Activity[];
  showPlannedExams?: boolean;
}) {
  const lang = cv.headingsLang;
  const city = cv.contacts.city || profile.city || "";
  const gpa =
    profile.gpa != null && profile.gpa_scale != null
      ? `${profile.gpa} / ${profile.gpa_scale}`
      : "";
  const visibleExams = showPlannedExams
    ? exams
    : exams.filter((exam) => exam.status === "taken");
  const plannedLabel =
    lang === "en" ? strings.cv.plannedSuffixEn : strings.cv.plannedSuffix;

  return (
    <article className="cv-document mx-auto max-w-[210mm] bg-background p-6 text-foreground shadow-sm ring-1 ring-foreground/10 print:max-w-none print:p-0 print:shadow-none print:ring-0">
      <header className="mb-6 border-b pb-4">
        <h1 className="text-2xl font-semibold tracking-tight">{fullName}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {[email, cv.contacts.phone, city].filter(Boolean).join(" · ")}
        </p>
        {cv.contacts.links.length > 0 ? (
          <ul className="mt-2 flex flex-col gap-1 text-sm">
            {cv.contacts.links
              .filter((link) => link.url)
              .map((link) => {
                const url = link.url.trim();
                return (
                  <li key={`${link.label}-${url}`}>
                    {link.label ? `${link.label}: ` : ""}
                    {isSafeHttpUrl(url) ? (
                      <a href={url} rel="noopener noreferrer" target="_blank">
                        {url}
                      </a>
                    ) : (
                      url
                    )}
                  </li>
                );
              })}
          </ul>
        ) : null}
      </header>

      {cv.summary.trim() ? (
        <section className="mb-5">
          <h2 className="mb-2 text-sm font-semibold tracking-wide uppercase">
            {cvHeading(lang, "about")}
          </h2>
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{cv.summary}</p>
        </section>
      ) : null}

      {(cv.education.institution || profile.grade_or_year || gpa) ? (
        <section className="mb-5">
          <h2 className="mb-2 text-sm font-semibold tracking-wide uppercase">
            {cvHeading(lang, "education")}
          </h2>
          <p className="text-sm font-medium">{cv.education.institution || "—"}</p>
          <p className="text-sm text-muted-foreground">
            {[profile.grade_or_year, gpa].filter(Boolean).join(" · ")}
          </p>
        </section>
      ) : null}

      {visibleExams.length > 0 ? (
        <section className="mb-5">
          <h2 className="mb-2 text-sm font-semibold tracking-wide uppercase">
            {cvHeading(lang, "exams")}
          </h2>
          <ul className="flex flex-col gap-1 text-sm">
            {visibleExams.map((exam) => (
              <li key={`${exam.code}-${exam.subject ?? ""}-${exam.date ?? ""}`}>
                {formatExamEntry(
                  exam,
                  exam.status === "planned" ? plannedLabel : undefined,
                )}
                {exam.date ? ` · ${exam.date}` : ""}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {activities.filter((item) => item.title.trim()).length > 0 ? (
        <section className="mb-5">
          <h2 className="mb-2 text-sm font-semibold tracking-wide uppercase">
            {cvHeading(lang, "activities")}
          </h2>
          <ul className="flex flex-col gap-3">
            {activities
              .filter((item) => item.title.trim())
              .map((item) => (
                <li key={item.id}>
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {[
                      strings.cv.activityTypes[item.type],
                      item.role,
                      item.organization,
                      [item.start_date, item.end_date].filter(Boolean).join(" – "),
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  {item.description ? (
                    <p className="mt-1 text-sm">{item.description}</p>
                  ) : null}
                  {item.achievement ? (
                    <p className="mt-1 text-sm">{item.achievement}</p>
                  ) : null}
                </li>
              ))}
          </ul>
        </section>
      ) : null}

      {cv.skills.length > 0 ? (
        <section className="mb-5">
          <h2 className="mb-2 text-sm font-semibold tracking-wide uppercase">
            {cvHeading(lang, "skills")}
          </h2>
          <p className="text-sm">{cv.skills.join(" · ")}</p>
        </section>
      ) : null}

      {cv.languages.filter((item) => item.name.trim()).length > 0 ? (
        <section className="mb-5">
          <h2 className="mb-2 text-sm font-semibold tracking-wide uppercase">
            {cvHeading(lang, "languages")}
          </h2>
          <ul className="flex flex-col gap-1 text-sm">
            {cv.languages
              .filter((item) => item.name.trim())
              .map((item) => (
                <li key={item.name}>
                  {item.name}
                  {item.level ? ` — ${item.level}` : ""}
                </li>
              ))}
          </ul>
        </section>
      ) : null}

      {!cv.summary &&
      !cv.education.institution &&
      visibleExams.length === 0 &&
      activities.every((item) => !item.title.trim()) &&
      cv.skills.length === 0 &&
      cv.languages.every((item) => !item.name.trim()) ? (
        <p className="text-sm text-muted-foreground print:hidden">{strings.cv.emptyPreview}</p>
      ) : null}
    </article>
  );
}
