"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import { updateProfileAction } from "@/app/(app)/profile/actions";
import { BudgetField } from "@/components/profile/fields/budget-field";
import { CityField } from "@/components/profile/fields/city-field";
import { CountriesField } from "@/components/profile/fields/countries-field";
import { EnglishLevelField } from "@/components/profile/fields/english-field";
import { ExamsField } from "@/components/profile/fields/exams-field";
import { GpaField } from "@/components/profile/fields/gpa-field";
import { IntakeYearField } from "@/components/profile/fields/intake-year-field";
import { MajorField } from "@/components/profile/fields/major-field";
import { StatusField } from "@/components/profile/fields/status-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { ApplicantPath } from "@/lib/database.types";
import { profileFormSchema } from "@/lib/profile/schemas";
import type { EnglishLevel, ExamEntry, GpaScale, ProfileData } from "@/lib/profile/types";
import { GRADUATE_GRADES, TRANSFER_YEARS } from "@/lib/profile/types";
import { firstZodMessage } from "@/lib/profile/zod-error";
import { strings } from "@/lib/strings";

function snapshot(values: unknown): string {
  return JSON.stringify(values);
}

export function ProfileForm({
  profile,
  countries,
}: {
  profile: ProfileData;
  countries: string[];
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [fullName, setFullName] = useState(profile.full_name ?? "");
  const [path, setPath] = useState<ApplicantPath | null>(profile.path);
  const [grade, setGrade] = useState(profile.grade_or_year);
  const [city, setCity] = useState(profile.city ?? "");
  const [intakeYear, setIntakeYear] = useState<number | null>(profile.intake_year);
  const [major, setMajor] = useState(profile.intended_major ?? "");
  const [targetCountries, setTargetCountries] = useState(profile.target_countries);
  const [budgetUsd, setBudgetUsd] = useState<number | null>(profile.budget_usd);
  const [needsScholarship, setNeedsScholarship] = useState(profile.needs_scholarship);
  const [englishLevel, setEnglishLevel] = useState<EnglishLevel | null>(
    (profile.english_level as EnglishLevel | null) ?? null,
  );
  const [exams, setExams] = useState<ExamEntry[]>(profile.exams);
  const [gpa, setGpa] = useState<number | null>(profile.gpa);
  const [gpaScale, setGpaScale] = useState<GpaScale | null>(
    profile.gpa_scale === 4 ||
      profile.gpa_scale === 5 ||
      profile.gpa_scale === 10 ||
      profile.gpa_scale === 100
      ? profile.gpa_scale
      : 5,
  );

  const current = {
    full_name: fullName,
    path,
    grade_or_year: grade,
    city,
    intake_year: intakeYear,
    intended_major: major,
    target_countries: targetCountries,
    budget_usd: budgetUsd,
    needs_scholarship: needsScholarship,
    english_level: englishLevel,
    exams,
    gpa,
    gpa_scale: gpaScale,
  };

  const [baseline, setBaseline] = useState(() => snapshot(current));
  const dirty = snapshot(current) !== baseline;

  useEffect(() => {
    if (!dirty) return;
    function onBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = "";
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  function handlePathChange(next: ApplicantPath) {
    setPath(next);
    const allowed = next === "transfer" ? TRANSFER_YEARS : GRADUATE_GRADES;
    if (grade && !(allowed as readonly string[]).includes(grade)) {
      setGrade(null);
    }
  }

  function onSubmit() {
    const parsed = profileFormSchema.safeParse({
      full_name: fullName,
      path,
      grade_or_year: grade,
      city,
      intended_major: major.trim() ? major.trim() : null,
      target_countries: targetCountries,
      budget_usd: budgetUsd,
      needs_scholarship: needsScholarship,
      english_level: englishLevel,
      exams,
      gpa,
      gpa_scale: gpa == null ? gpaScale : gpaScale,
      intake_year: intakeYear,
    });
    if (!parsed.success) {
      setError(firstZodMessage(parsed.error));
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await updateProfileAction(parsed.data);
      if (result.error) {
        setError(result.error);
        toast.error(result.error);
        return;
      }
      toast.success(strings.profile.saved);
      setBaseline(snapshot(current));
    });
  }

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      noValidate
    >
      <div aria-live="assertive">
        <FieldError>{error}</FieldError>
      </div>

      <Card id="basics">
        <CardHeader>
          <CardTitle>{strings.profile.sections.basics}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <Field>
            <FieldLabel htmlFor="fullName">{strings.profile.fields.fullName}</FieldLabel>
            <Input
              id="fullName"
              className="min-h-11"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              autoComplete="name"
            />
          </Field>
          <StatusField
            path={path}
            gradeOrYear={grade}
            onPathChange={handlePathChange}
            onGradeChange={setGrade}
          />
          <CityField value={city} onChange={setCity} />
          <IntakeYearField value={intakeYear} onChange={setIntakeYear} />
        </CardContent>
      </Card>

      <Card id="goals">
        <CardHeader>
          <CardTitle>{strings.profile.sections.goals}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <MajorField value={major} onChange={setMajor} />
          <CountriesField
            countries={countries}
            value={targetCountries}
            onChange={setTargetCountries}
          />
        </CardContent>
      </Card>

      <Card id="budget">
        <CardHeader>
          <CardTitle>{strings.profile.sections.budget}</CardTitle>
        </CardHeader>
        <CardContent>
          <BudgetField
            budgetUsd={budgetUsd}
            needsScholarship={needsScholarship}
            onBudgetChange={setBudgetUsd}
            onScholarshipChange={setNeedsScholarship}
          />
        </CardContent>
      </Card>

      <Card id="english">
        <CardHeader>
          <CardTitle>{strings.profile.sections.english}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <EnglishLevelField value={englishLevel} onChange={setEnglishLevel} />
          <ExamsField value={exams} onChange={setExams} />
        </CardContent>
      </Card>

      <Card id="academics">
        <CardHeader>
          <CardTitle>{strings.profile.sections.academics}</CardTitle>
        </CardHeader>
        <CardContent>
          <GpaField
            gpa={gpa}
            gpaScale={gpaScale}
            onGpaChange={setGpa}
            onScaleChange={setGpaScale}
          />
        </CardContent>
      </Card>

      <Button type="submit" className="min-h-11 self-start" disabled={isPending}>
        {isPending ? strings.common.saving : strings.profile.save}
      </Button>
    </form>
  );
}
