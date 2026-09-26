"use client";

import Link from "next/link";

import { StepForm } from "@/components/onboarding/step-form";
import { useOnboardingStep } from "@/components/onboarding/use-onboarding-step";
import { getBudgetLabel, getEnglishLevelLabel, formatExamEntry } from "@/lib/profile/labels";
import { getCountryLabel } from "@/lib/profile/types";
import type { ProfileData } from "@/lib/profile/types";
import { strings } from "@/lib/strings";

function Row({
  label,
  value,
  step,
}: {
  label: string;
  value: string;
  step: number;
}) {
  return (
    <div className="flex min-h-11 items-start justify-between gap-3 border-b py-3 last:border-b-0">
      <div className="flex flex-col gap-1">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span>{value || strings.onboarding.steps.summary.empty}</span>
      </div>
      <Link
        href={`/onboarding?step=${step}`}
        className="min-h-11 shrink-0 rounded-lg px-2 py-2 text-sm font-medium underline underline-offset-4 focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {strings.common.edit}
      </Link>
    </div>
  );
}

function formatExams(profile: ProfileData): string {
  if (profile.exams.length === 0) return "";
  return profile.exams
    .map((exam) =>
      formatExamEntry(
        exam,
        exam.status === "planned" ? strings.cv.plannedSuffix : undefined,
      ),
    )
    .join(", ");
}

function formatBudget(profile: ProfileData): string {
  return getBudgetLabel(profile.budget_usd);
}

function formatGpa(profile: ProfileData): string {
  if (profile.gpa == null || profile.gpa_scale == null) return "";
  return `${profile.gpa} / ${profile.gpa_scale}`;
}

function formatStatus(profile: ProfileData): string {
  if (!profile.path) return "";
  const pathLabel =
    profile.path === "graduate"
      ? strings.onboarding.steps.status.graduate
      : strings.onboarding.steps.status.transfer;
  return [pathLabel, profile.grade_or_year].filter(Boolean).join(" · ");
}

export function StepSummary({ profile }: { profile: ProfileData }) {
  const { isPending, error, goBack, complete } = useOnboardingStep(10);
  const s = strings.onboarding.steps.summary;

  return (
    <StepForm
      title={s.title}
      legend={s.hint}
      error={error}
      isPending={isPending}
      showBack
      onBack={goBack}
      onSubmit={complete}
      submitLabel={isPending ? strings.onboarding.completing : strings.onboarding.complete}
    >
      <Row label={s.fields.status} value={formatStatus(profile)} step={1} />
      <Row label={s.fields.city} value={profile.city ?? ""} step={2} />
      <Row label={s.fields.major} value={profile.intended_major ?? ""} step={3} />
      <Row
        label={s.fields.countries}
        value={profile.target_countries.map(getCountryLabel).join(", ")}
        step={4}
      />
      <Row label={s.fields.budget} value={formatBudget(profile)} step={5} />
      {profile.budget_usd === 0 ? null : (
        <Row
          label={s.fields.scholarship}
          value={profile.needs_scholarship ? s.yes : s.no}
          step={5}
        />
      )}
      <Row
        label={s.fields.english}
        value={getEnglishLevelLabel(profile.english_level)}
        step={6}
      />
      <Row label={s.fields.exams} value={formatExams(profile)} step={7} />
      <Row label={s.fields.gpa} value={formatGpa(profile)} step={8} />
      <Row
        label={s.fields.intakeYear}
        value={profile.intake_year ? String(profile.intake_year) : ""}
        step={9}
      />
    </StepForm>
  );
}
