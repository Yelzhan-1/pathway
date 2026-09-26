"use client";

import { useState } from "react";
import { toast } from "sonner";

import { ScoreRing } from "@/components/pathway/essay/ScoreRing";
import { Collapsible } from "@/components/pathway/ui/Collapsible";
import { Letter } from "@/components/pathway/ui/illustrations";
import { Button, PageHeader, TCard } from "@/components/pathway/ui/tropa";
import { ESSAY_LETTER_MAX_LENGTH, type EssayAnalysis } from "@/lib/essay/schema";
import { strings } from "@/lib/strings";
import { cn } from "@/lib/utils";

type UniversityOption = { slug: string; name: string; country: string };

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(strings.essay.copied);
  } catch {
    toast.error(strings.essay.copyFailed);
  }
}

function CriteriaBar({ score, label }: { score: number; label: string }) {
  return (
    <li>
      <div className="flex items-center justify-between text-[13.5px] font-bold">
        <span>{label}</span>
        <span className="text-muted-foreground">{score} из 5</span>
      </div>
      <div className="mt-1 h-2.5 rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${(score / 5) * 100}%` }}
        />
      </div>
    </li>
  );
}

function EssayResult({ result }: { result: EssayAnalysis }) {
  return (
    <div className="flex flex-col gap-4">
      <TCard className="flex flex-col items-center gap-3 text-center sm:flex-row sm:items-center sm:text-left">
        <ScoreRing value={result.overallScore} size={112} stroke={11} />
        <div>
          <p className="text-[12px] font-bold text-muted-foreground">{strings.essay.overallLabel}</p>
          <p className="mt-1 text-[15px] font-bold leading-snug">{result.verdict}</p>
        </div>
      </TCard>

      <TCard>
        <p className="text-[14px] font-bold">{strings.essay.criteriaLabel}</p>
        <ul className="mt-3 flex flex-col gap-3">
          {result.criteria.map((criterion) => (
            <CriteriaBar
              key={criterion.id}
              score={criterion.score}
              label={strings.essay.criteria[criterion.id]}
            />
          ))}
        </ul>
        <ul className="mt-3 flex flex-col gap-1.5 text-[13px] font-medium leading-snug text-ink-2">
          {result.criteria.map((criterion) => (
            <li key={criterion.id}>
              <span className="font-bold text-foreground">{strings.essay.criteria[criterion.id]}: </span>
              {criterion.comment}
            </li>
          ))}
        </ul>
      </TCard>

      <div className="grid gap-4 sm:grid-cols-2">
        <TCard surface="mint">
          <p className="text-[14px] font-bold">{strings.essay.strengthsTitle}</p>
          <ul className="mt-2 flex flex-col gap-1.5 text-[13.5px] font-medium leading-snug">
            {result.strengths.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </TCard>
        <TCard surface="honey">
          <p className="text-[14px] font-bold">{strings.essay.blockersTitle}</p>
          <ul className="mt-2 flex flex-col gap-1.5 text-[13.5px] font-medium leading-snug">
            {result.blockers.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </TCard>
      </div>

      <TCard>
        <p className="text-[14px] font-bold">{strings.essay.editsTitle}</p>
        <ul className="mt-3 flex flex-col gap-2">
          {result.edits.map((edit, index) => (
            <li key={`${edit.quote}-${index}`} className="rounded-[14px] bg-background px-3 py-2.5 ring-1 ring-border">
              <p className="text-[13px] font-medium leading-snug text-ink-2">
                <span className="font-bold text-foreground">{strings.essay.editWas}: </span>
                «{edit.quote}»
              </p>
              <Collapsible className="mt-1.5" label={strings.essay.editNow}>
                <p>{edit.rewrite}</p>
                <p className="mt-1.5">
                  <span className="font-bold text-foreground">{strings.essay.editWhy}: </span>
                  {edit.why}
                </p>
                <Button
                  type="button"
                  variant="soft"
                  size="sm"
                  className="mt-2"
                  onClick={() => void copyText(edit.rewrite)}
                >
                  {strings.essay.copyEdit}
                </Button>
              </Collapsible>
            </li>
          ))}
        </ul>
      </TCard>

      <TCard surface="forest">
        <p className="text-[12px] font-bold text-white/70">{strings.essay.nextStepTitle}</p>
        <p className="mt-1 text-[15px] font-bold leading-snug">{result.nextStep}</p>
      </TCard>
    </div>
  );
}

export function EssayScreen({ universities }: { universities: UniversityOption[] }) {
  const [letter, setLetter] = useState("");
  const [universitySlug, setUniversitySlug] = useState(universities[0]?.slug ?? "");
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<EssayAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!letter.trim() || !universitySlug || pending) return;
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/essay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ letter, universitySlug }),
      });
      const payload = (await response.json().catch(() => null)) as
        | { result?: EssayAnalysis; error?: string }
        | null;
      if (!response.ok || !payload?.result) {
        setError(payload?.error || strings.essay.unavailable);
        return;
      }
      setResult(payload.result);
    } catch {
      setError(strings.essay.unavailable);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={strings.essay.title} subtitle={strings.essay.subtitle} illustration={<Letter className="w-full" />} />

      <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <TCard as="div" className="flex flex-col gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-bold text-muted-foreground">{strings.essay.universityLabel}</span>
            <select
              value={universitySlug}
              onChange={(event) => setUniversitySlug(event.target.value)}
              className="h-11 rounded-[14px] bg-background px-3 text-[14px] font-semibold ring-1 ring-border"
            >
              {universities.length === 0 && <option value="">{strings.essay.universityPlaceholder}</option>}
              {universities.map((university) => (
                <option key={university.slug} value={university.slug}>
                  {university.name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-bold text-muted-foreground">{strings.essay.letterLabel}</span>
            <textarea
              value={letter}
              onChange={(event) => setLetter(event.target.value)}
              maxLength={ESSAY_LETTER_MAX_LENGTH}
              rows={12}
              placeholder={strings.essay.letterPlaceholder}
              className="min-h-[240px] rounded-[16px] bg-background px-3.5 py-3 text-[14px] font-medium leading-snug ring-1 ring-border"
            />
            <span
              className={cn(
                "self-end text-[12px] font-bold",
                letter.length >= ESSAY_LETTER_MAX_LENGTH ? "text-destructive" : "text-muted-foreground",
              )}
            >
              {strings.essay.letterCount(letter.length, ESSAY_LETTER_MAX_LENGTH)}
            </span>
          </label>

          <p className="text-[12px] font-medium leading-snug text-muted-foreground">{strings.essay.noStorage}</p>

          {error && (
            <p role="alert" className="rounded-[16px] bg-danger-soft px-3.5 py-2.5 text-[13.5px] font-semibold text-destructive">
              {error}
            </p>
          )}

          <Button
            type="button"
            onClick={() => void submit()}
            disabled={pending || !letter.trim() || !universitySlug}
          >
            {pending ? strings.essay.submitting : strings.essay.submit}
          </Button>
        </TCard>

        <div>
          {result ? (
            <EssayResult result={result} />
          ) : (
            <TCard className="flex min-h-[240px] flex-col items-center justify-center gap-3 border-2 border-dashed border-input text-center">
              <Letter className="w-16 opacity-70" />
              <p className="max-w-[320px] text-[14px] font-medium leading-snug text-muted-foreground">
                {strings.essay.empty}
              </p>
            </TCard>
          )}
        </div>
      </div>
    </div>
  );
}
