"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";

import { updateProfileAction } from "@/app/(app)/profile/actions";
import { BudgetField } from "@/components/profile/fields/budget-field";
import { CityField } from "@/components/profile/fields/city-field";
import { CountriesField } from "@/components/profile/fields/countries-field";
import { EnglishLevelField } from "@/components/profile/fields/english-field";
import { ExamsField, type ExamsFieldHandle } from "@/components/profile/fields/exams-field";
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
import { resolveOtherValue } from "@/lib/profile/presets";
import type { EnglishLevel, ExamEntry, GpaScale, ProfileData } from "@/lib/profile/types";
import { GRADUATE_GRADES, KZ_CITIES, MAJOR_OPTIONS, TRANSFER_YEARS } from "@/lib/profile/types";
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
  const examsRef = useRef<ExamsFieldHandle>(null);
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [attempted, setAttempted] = useState(false);

  const [fullName, setFullName] = useState(profile.full_name ?? "");
  const [path, setPath] = useState<ApplicantPath | null>(profile.path);
  const [grade, setGrade] = useState(profile.grade_or_year);
  const [city, setCity] = useState(profile.city ?? "");
  const [cityIsOther, setCityIsOther] = useState(
    () =>
      (profile.city ?? "").trim().length > 0 &&
      !(KZ_CITIES as readonly string[]).includes(profile.city ?? ""),
  );
  const [intakeYear, setIntakeYear] = useState<number | null>(profile.intake_year);
  const [major, setMajor] = useState(profile.intended_major ?? "");
  const [majorIsOther, setMajorIsOther] = useState(
    () =>
      (profile.intended_major ?? "").trim().length > 0 &&
      !(MAJOR_OPTIONS as readonly string[]).includes(profile.intended_major ?? ""),
  );
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

  const cityResolved = resolveOtherValue(city, KZ_CITIES, cityIsOther);
  const majorResolved = resolveOtherValue(major, MAJOR_OPTIONS, majorIsOther);

  const current = {
    full_name: fullName,
    path,
    grade_or_year: grade,
    city: cityResolved.value,
    city_is_other: cityResolved.isOther,
    intended_major: majorResolved.value ? majorResolved.value : null,
    major_is_other: majorResolved.isOther,
    target_countries: targetCountries,
    budget_usd: budgetUsd,
    needs_scholarship: needsScholarship,
    english_level: englishLevel,
    exams,
    gpa,
    gpa_scale: gpa == null ? null : gpaScale,
    intake_year: intakeYear,
  };

  const serialized = snapshot(current);
  const [baseline, setBaseline] = useState(() => serialized);
  const dirty = serialized !== baseline;

  const clientError = attempted
    ? (() => {
        const parsed = profileFormSchema.safeParse(
          JSON.parse(serialized) as unknown,
        );
        return parsed.success ? null : firstZodMessage(parsed.error);
      })()
    : null;

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
    setAttempted(true);
    const pending = examsRef.current?.commitPending() ?? { ok: true as const, exams };
    if (!pending.ok) return;
    setExams(pending.exams);
    const payload = {
      ...current,
      exams: pending.exams,
      gpa_scale: gpa == null ? null : gpaScale,
    };
    const parsed = profileFormSchema.safeParse(payload);
    if (!parsed.success) {
      return;
    }
    if (cityResolved.value !== city) setCity(cityResolved.value);
    if (cityResolved.isOther !== cityIsOther) setCityIsOther(cityResolved.isOther);
    if (majorResolved.value !== major) setMajor(majorResolved.value);
    if (majorResolved.isOther !== majorIsOther) setMajorIsOther(majorResolved.isOther);
    setServerError(null);
    startTransition(async () => {
      const result = await updateProfileAction(parsed.data);
      if (result.error) {
        setServerError(result.error);
        toast.error(result.error);
        return;
      }
      toast.success(strings.profile.saved);
      setBaseline(snapshot(payload));
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
        {clientError ? <FieldError>{strings.profile.checkFields}</FieldError> : null}
        {!clientError && serverError ? <FieldError>{serverError}</FieldError> : null}
      </div>

      <Card id="basics">
        <CardHeader>
          <CardTitle>{strings.profile.sections.basics}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <Field id="full_name" className="scroll-mt-24">
            <FieldLabel htmlFor="fullName">{strings.profile.fields.fullName}</FieldLabel>
            <Input
              id="fullName"
              className="h-11 min-h-11"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              autoComplete="name"
            />
          </Field>
          <div id="path" className="scroll-mt-24">
          <StatusField
            path={path}
            gradeOrYear={grade}
            onPathChange={handlePathChange}
            onGradeChange={setGrade}
          />
          </div>
          <div id="city" className="scroll-mt-24">
          <CityField
            value={city}
            onChange={setCity}
            submitted={attempted}
            isOther={cityIsOther}
            onIsOtherChange={setCityIsOther}
          />
          </div>
          <div id="intake_year" className="scroll-mt-24">
          <IntakeYearField value={intakeYear} onChange={setIntakeYear} />
          </div>
        </CardContent>
      </Card>

      <Card id="goals">
        <CardHeader>
          <CardTitle>{strings.profile.sections.goals}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div id="intended_major" className="scroll-mt-24">
          <MajorField
            value={major}
            onChange={setMajor}
            submitted={attempted}
            isOther={majorIsOther}
            onIsOtherChange={setMajorIsOther}
          />
          </div>
          <div id="target_countries" className="scroll-mt-24">
          <CountriesField
            countries={countries}
            value={targetCountries}
            onChange={setTargetCountries}
          />
          </div>
        </CardContent>
      </Card>

      <Card id="budget" className="scroll-mt-24">
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
          <div id="english_level" className="scroll-mt-24">
          <EnglishLevelField value={englishLevel} onChange={setEnglishLevel} />
          </div>
          <div id="exams" className="scroll-mt-24">
          <ExamsField ref={examsRef} value={exams} onChange={setExams} />
          </div>
        </CardContent>
      </Card>

      <Card id="academics">
        <CardHeader>
          <CardTitle>{strings.profile.sections.academics}</CardTitle>
        </CardHeader>
        <CardContent>
          <div id="gpa" className="scroll-mt-24">
          <GpaField
            gpa={gpa}
            gpaScale={gpaScale}
            onGpaChange={setGpa}
            onScaleChange={setGpaScale}
          />
          </div>
        </CardContent>
      </Card>

      <Button type="submit" className="min-h-11 self-start" disabled={isPending}>
        {isPending ? strings.common.saving : strings.profile.save}
      </Button>
    </form>
  );
}
