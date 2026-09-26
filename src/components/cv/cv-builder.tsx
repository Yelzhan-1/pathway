"use client";

import { cn } from "cn";
import { useRef, useState } from "react";

import { saveActivitiesAction, saveCvAction } from "@/app/(app)/cv/actions";
import { AutosaveIndicator } from "@/components/cv/autosave-indicator";
import { CvDocument } from "@/components/cv/cv-document";
import { HeadingLangToggle } from "@/components/cv/heading-lang-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { moveActivity, newActivityId } from "@/lib/profile/activities";
import { formatExamEntry } from "@/lib/profile/labels";
import { parseActivities, parseCv } from "@/lib/profile/parse";
import { useAutosave, type AutosaveWriteResult } from "@/lib/hooks/use-autosave";
import { ACTIVITY_TYPES, emptyCv, type Activity, type Cv, type ProfileData } from "@/lib/profile/types";
import { cvLinkError } from "@/lib/profile/url";
import { strings } from "@/lib/strings";

function sanitizeCv(cv: Cv): Cv {
  return {
    ...cv,
    summary: cv.summary.trim(),
    skills: cv.skills.map((item) => item.trim()).filter(Boolean),
    languages: cv.languages.filter((item) => item.name.trim()),
    contacts: {
      ...cv.contacts,
      phone: cv.contacts.phone.trim(),
      city: cv.contacts.city.trim(),
      links: cv.contacts.links
        .map((link) => ({ label: link.label.trim(), url: link.url.trim() }))
        .filter((link) => link.url.length > 0 && cvLinkError(link.url) == null),
    },
    education: {
      institution: cv.education.institution.trim(),
    },
  };
}

export function CvBuilder({
  profile,
  email,
  userId,
  updatedAt,
}: {
  profile: ProfileData;
  email: string;
  userId: string;
  updatedAt: string | null;
}) {
  const fullName = profile.full_name ?? email;
  const versionRef = useRef(updatedAt);
  const [cv, setCv] = useState<Cv>({
    ...emptyCv(),
    ...profile.cv,
    contacts: {
      ...emptyCv().contacts,
      ...profile.cv.contacts,
      city: profile.cv.contacts.city || profile.city || "",
      links: profile.cv.contacts.links ?? [],
    },
    education: {
      institution: profile.cv.education.institution ?? "",
    },
    languages: profile.cv.languages ?? [],
    skills: profile.cv.skills ?? [],
  });
  const [activities, setActivities] = useState<Activity[]>(profile.activities);
  const [mobileTab, setMobileTab] = useState("editor");
  const [showPlannedExams, setShowPlannedExams] = useState(false);

  const version = {
    get: () => versionRef.current,
    set: (value: string) => {
      versionRef.current = value;
    },
  };

  const cvSave = useAutosave(
    cv,
    async (patch): Promise<AutosaveWriteResult<Cv>> => {
      const result = await saveCvAction(patch, versionRef.current);
      if (result.conflict) {
        return {
          error: null,
          conflict: {
            serverValue: result.conflict.data,
            updatedAt: result.conflict.updatedAt,
          },
        };
      }
      return { error: result.error, updatedAt: result.updatedAt };
    },
    {
      prepare: sanitizeCv,
      keepalive: { url: "/api/cv/autosave", kind: "cv" },
      journal: { userId, kind: "cv" },
      onRestore: (payload) => setCv(parseCv(payload)),
      version,
    },
  );
  const activitiesSave = useAutosave(
    activities,
    async (patch): Promise<AutosaveWriteResult<Activity[]>> => {
      const result = await saveActivitiesAction(patch, versionRef.current);
      if (result.conflict) {
        return {
          error: null,
          conflict: {
            serverValue: result.conflict.data,
            updatedAt: result.conflict.updatedAt,
          },
        };
      }
      return { error: result.error, updatedAt: result.updatedAt };
    },
    {
      keepalive: { url: "/api/cv/autosave", kind: "activities" },
      journal: { userId, kind: "activities" },
      onRestore: (payload) => setActivities(parseActivities(payload)),
      version,
    },
  );

  const saveStatus =
    cvSave.status === "error" || activitiesSave.status === "error"
      ? "error"
      : cvSave.status === "saving" || activitiesSave.status === "saving"
        ? "saving"
        : cvSave.status === "saved" || activitiesSave.status === "saved"
          ? "saved"
          : "idle";
  const saveError = cvSave.error ?? activitiesSave.error;

  const preview = (
    <CvDocument
      fullName={fullName}
      email={email}
      profile={profile}
      cv={sanitizeCv(cv)}
      exams={profile.exams}
      activities={activities}
      showPlannedExams={showPlannedExams}
    />
  );

  const editor = (
    <div className="flex flex-col gap-6 print:hidden">
      <Card>
        <CardHeader>
          <CardTitle>{strings.cv.sections.contacts}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <Label htmlFor="cv-email">{strings.cv.fields.email}</Label>
            <Input id="cv-email" className="min-h-11" value={email} readOnly />
            <p className="text-sm text-muted-foreground">{strings.cv.emailReadonly}</p>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="cv-phone">{strings.cv.fields.phone}</Label>
            <Input
              id="cv-phone"
              className="min-h-11"
              value={cv.contacts.phone}
              onChange={(event) =>
                setCv({
                  ...cv,
                  contacts: { ...cv.contacts, phone: event.target.value },
                })
              }
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="cv-city">{strings.cv.fields.city}</Label>
            <Input
              id="cv-city"
              className="min-h-11"
              value={cv.contacts.city}
              onChange={(event) =>
                setCv({
                  ...cv,
                  contacts: { ...cv.contacts, city: event.target.value },
                })
              }
            />
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">{strings.cv.fields.links}</p>
            {cv.contacts.links.map((link, index) => {
              const linkError = cvLinkError(link.url);
              return (
              <div key={`link-${index}`} className="flex flex-col gap-2">
                <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                <Input
                  className="min-h-11"
                  placeholder={strings.cv.fields.linkLabel}
                  value={link.label}
                  aria-invalid={Boolean(linkError)}
                  onChange={(event) => {
                    const links = cv.contacts.links.slice();
                    links[index] = { ...link, label: event.target.value };
                    setCv({ ...cv, contacts: { ...cv.contacts, links } });
                  }}
                />
                <Input
                  className="min-h-11"
                  placeholder={strings.cv.fields.linkUrl}
                  value={link.url}
                  aria-invalid={Boolean(linkError)}
                  onChange={(event) => {
                    const links = cv.contacts.links.slice();
                    links[index] = { ...link, url: event.target.value };
                    setCv({ ...cv, contacts: { ...cv.contacts, links } });
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  className="min-h-11"
                  onClick={() =>
                    setCv({
                      ...cv,
                      contacts: {
                        ...cv.contacts,
                        links: cv.contacts.links.filter((_, i) => i !== index),
                      },
                    })
                  }
                >
                  {strings.common.delete}
                </Button>
                </div>
                {linkError ? (
                  <p role="alert" className="text-sm text-destructive">
                    {linkError}
                  </p>
                ) : null}
              </div>
              );
            })}
            <Button
              type="button"
              variant="outline"
              className="min-h-11 self-start"
              onClick={() =>
                setCv({
                  ...cv,
                  contacts: {
                    ...cv.contacts,
                    links: [...cv.contacts.links, { label: "", url: "" }],
                  },
                })
              }
            >
              {strings.cv.fields.addLink}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{strings.cv.sections.about}</CardTitle>
        </CardHeader>
        <CardContent>
          <Label htmlFor="cv-summary" className="sr-only">
            {strings.cv.fields.summary}
          </Label>
          <Textarea
            id="cv-summary"
            value={cv.summary}
            placeholder={strings.cv.fields.summaryPlaceholder}
            onChange={(event) => setCv({ ...cv, summary: event.target.value })}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{strings.cv.sections.education}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <Label htmlFor="cv-school">{strings.cv.fields.institution}</Label>
            <Input
              id="cv-school"
              className="min-h-11"
              value={cv.education.institution}
              onChange={(event) =>
                setCv({
                  ...cv,
                  education: { institution: event.target.value },
                })
              }
            />
          </div>
          <p className="text-sm text-muted-foreground">
            {strings.cv.fields.grade}: {profile.grade_or_year || "—"}
          </p>
          <p className="text-sm text-muted-foreground">
            {strings.cv.fields.gpa}:{" "}
            {profile.gpa != null && profile.gpa_scale != null
              ? `${profile.gpa} / ${profile.gpa_scale}`
              : "—"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{strings.cv.sections.exams}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex min-h-11 items-center justify-between gap-3">
            <Label htmlFor="cv-show-planned" className="text-sm leading-snug">
              {strings.cv.showPlannedExams}
            </Label>
            <Switch
              id="cv-show-planned"
              checked={showPlannedExams}
              onCheckedChange={(checked) => setShowPlannedExams(Boolean(checked))}
            />
          </div>
          {profile.exams.length === 0 ? (
            <p className="text-sm text-muted-foreground">{strings.onboarding.steps.summary.empty}</p>
          ) : (
            <ul className="flex flex-col gap-2 text-sm">
              {profile.exams.map((exam) => (
                <li key={`${exam.code}-${exam.subject ?? ""}`}>
                  {formatExamEntry(
                    exam,
                    exam.status === "planned" ? strings.cv.plannedSuffix : undefined,
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{strings.cv.sections.activities}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {activities.map((activity, index) => (
            <div key={activity.id} className="flex flex-col gap-3 rounded-xl border p-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor={`activity-type-${activity.id}`}>
                  {strings.cv.fields.activityType}
                </Label>
                <select
                  id={`activity-type-${activity.id}`}
                  className="min-h-11 rounded-lg border border-input bg-transparent px-2.5"
                  value={activity.type}
                  onChange={(event) => {
                    const next = activities.slice();
                    next[index] = {
                      ...activity,
                      type: event.target.value as Activity["type"],
                    };
                    setActivities(next);
                  }}
                >
                  {ACTIVITY_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {strings.cv.activityTypes[type]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor={`activity-title-${activity.id}`}>
                  {strings.cv.fields.activityTitle}
                </Label>
                <Input
                  id={`activity-title-${activity.id}`}
                  className="min-h-11"
                  value={activity.title}
                  onChange={(event) => {
                    const next = activities.slice();
                    next[index] = { ...activity, title: event.target.value };
                    setActivities(next);
                  }}
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor={`activity-role-${activity.id}`}>{strings.cv.fields.role}</Label>
                  <Input
                    id={`activity-role-${activity.id}`}
                    className="min-h-11"
                    value={activity.role}
                    onChange={(event) => {
                      const next = activities.slice();
                      next[index] = { ...activity, role: event.target.value };
                      setActivities(next);
                    }}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor={`activity-org-${activity.id}`}>
                    {strings.cv.fields.organization}
                  </Label>
                  <Input
                    id={`activity-org-${activity.id}`}
                    className="min-h-11"
                    value={activity.organization}
                    onChange={(event) => {
                      const next = activities.slice();
                      next[index] = { ...activity, organization: event.target.value };
                      setActivities(next);
                    }}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor={`activity-desc-${activity.id}`}>
                  {strings.cv.fields.description}
                </Label>
                <Textarea
                  id={`activity-desc-${activity.id}`}
                  value={activity.description}
                  onChange={(event) => {
                    const next = activities.slice();
                    next[index] = { ...activity, description: event.target.value };
                    setActivities(next);
                  }}
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor={`activity-start-${activity.id}`}>
                    {strings.cv.fields.startDate}
                  </Label>
                  <Input
                    id={`activity-start-${activity.id}`}
                    className="min-h-11"
                    type="date"
                    value={activity.start_date ?? ""}
                    onChange={(event) => {
                      const next = activities.slice();
                      next[index] = {
                        ...activity,
                        start_date: event.target.value || null,
                      };
                      setActivities(next);
                    }}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor={`activity-end-${activity.id}`}>
                    {strings.cv.fields.endDate}
                  </Label>
                  <Input
                    id={`activity-end-${activity.id}`}
                    className="min-h-11"
                    type="date"
                    value={activity.end_date ?? ""}
                    onChange={(event) => {
                      const next = activities.slice();
                      next[index] = {
                        ...activity,
                        end_date: event.target.value || null,
                      };
                      setActivities(next);
                    }}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor={`activity-ach-${activity.id}`}>
                  {strings.cv.fields.achievement}
                </Label>
                <Input
                  id={`activity-ach-${activity.id}`}
                  className="min-h-11"
                  value={activity.achievement}
                  onChange={(event) => {
                    const next = activities.slice();
                    next[index] = { ...activity, achievement: event.target.value };
                    setActivities(next);
                  }}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="min-h-11"
                  onClick={() => setActivities(moveActivity(activities, index, "up"))}
                >
                  {strings.common.moveUp}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="min-h-11"
                  onClick={() => setActivities(moveActivity(activities, index, "down"))}
                >
                  {strings.common.moveDown}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="min-h-11"
                  onClick={() =>
                    setActivities(activities.filter((item) => item.id !== activity.id))
                  }
                >
                  {strings.common.delete}
                </Button>
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            className="min-h-11 self-start"
            onClick={() =>
              setActivities([
                ...activities,
                {
                  id: newActivityId(),
                  type: "other",
                  title: "",
                  role: "",
                  organization: "",
                  description: "",
                  start_date: null,
                  end_date: null,
                  achievement: "",
                },
              ])
            }
          >
            {strings.cv.fields.addActivity}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{strings.cv.sections.skills}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {cv.skills.map((skill, index) => (
            <div key={`skill-${index}`} className="flex gap-2">
              <Input
                className="min-h-11"
                value={skill}
                onChange={(event) => {
                  const skills = cv.skills.slice();
                  skills[index] = event.target.value;
                  setCv({ ...cv, skills });
                }}
              />
              <Button
                type="button"
                variant="ghost"
                className="min-h-11"
                onClick={() =>
                  setCv({ ...cv, skills: cv.skills.filter((_, i) => i !== index) })
                }
              >
                {strings.common.delete}
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            className="min-h-11 self-start"
            onClick={() => setCv({ ...cv, skills: [...cv.skills, ""] })}
          >
            {strings.cv.fields.addSkill}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{strings.cv.sections.languages}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {cv.languages.map((language, index) => (
            <div key={`lang-${index}`} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
              <Input
                className="min-h-11"
                placeholder={strings.cv.fields.languageName}
                value={language.name}
                onChange={(event) => {
                  const languages = cv.languages.slice();
                  languages[index] = { ...language, name: event.target.value };
                  setCv({ ...cv, languages });
                }}
              />
              <Input
                className="min-h-11"
                placeholder={strings.cv.fields.languageLevel}
                value={language.level}
                onChange={(event) => {
                  const languages = cv.languages.slice();
                  languages[index] = { ...language, level: event.target.value };
                  setCv({ ...cv, languages });
                }}
              />
              <Button
                type="button"
                variant="ghost"
                className="min-h-11"
                onClick={() =>
                  setCv({
                    ...cv,
                    languages: cv.languages.filter((_, i) => i !== index),
                  })
                }
              >
                {strings.common.delete}
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            className="min-h-11 self-start"
            onClick={() =>
              setCv({
                ...cv,
                languages: [...cv.languages, { name: "", level: "" }],
              })
            }
          >
            {strings.cv.fields.addLanguage}
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="app-chrome flex flex-col gap-4 print:hidden sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-balance text-[28px] font-bold tracking-tight">{strings.cv.title}</h1>
          <AutosaveIndicator status={saveStatus} error={saveError} />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <HeadingLangToggle
            value={cv.headingsLang}
            onChange={(headingsLang) => setCv({ ...cv, headingsLang })}
          />
          <Button
            type="button"
            className="min-h-11"
            onClick={() => window.print()}
          >
            {strings.cv.downloadPdf}
          </Button>
        </div>
      </div>

      <div
        role="tablist"
        aria-label={strings.cv.title}
        className="grid w-full grid-cols-2 gap-1 rounded-lg bg-muted p-[3px] print:hidden xl:hidden"
      >
        <Button
          type="button"
          role="tab"
          aria-selected={mobileTab === "editor"}
          variant={mobileTab === "editor" ? "secondary" : "ghost"}
          className="min-h-11"
          onClick={() => setMobileTab("editor")}
        >
          {strings.cv.editor}
        </Button>
        <Button
          type="button"
          role="tab"
          aria-selected={mobileTab === "preview"}
          variant={mobileTab === "preview" ? "secondary" : "ghost"}
          className="min-h-11"
          onClick={() => setMobileTab("preview")}
        >
          {strings.cv.preview}
        </Button>
      </div>

      <div className="flex flex-col gap-6 xl:grid xl:grid-cols-[minmax(0,1fr)_600px]">
        <div
          className={cn(
            "print:hidden",
            mobileTab === "preview" && "max-xl:hidden",
          )}
        >
          {editor}
        </div>
        <div
          className={cn(
            "print:hidden xl:sticky xl:top-6 xl:self-start",
            mobileTab === "editor" && "max-xl:hidden",
          )}
        >
          {preview}
        </div>
      </div>

      <div className="hidden print:block">{preview}</div>
    </div>
  );
}
