"use client";

import { forwardRef, useImperativeHandle, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { A_LEVEL_GRADES, EXAM_CODES, EXAMS_WITH_OPTIONAL_SUBJECT, type ExamCode } from "@/lib/profile/exam-ranges";
import { formatExamEntry, getExamCodeLabel } from "@/lib/profile/labels";
import { commitPendingExam } from "@/lib/profile/pending-exam";
import type { ExamEntry, ExamStatus } from "@/lib/profile/types";
import { strings } from "@/lib/strings";

const STATUS_OPTIONS: { value: ExamStatus; label: string }[] = [
  { value: "taken", label: strings.profile.exam.taken },
  { value: "planned", label: strings.profile.exam.planned },
];

export type ExamsFieldHandle = {
  commitPending: () =>
    | { ok: true; exams: ExamEntry[] }
    | { ok: false; error: string };
};

export const ExamsField = forwardRef<
  ExamsFieldHandle,
  {
    value: ExamEntry[];
    onChange: (exams: ExamEntry[]) => void;
    allowedCodes?: readonly ExamCode[];
  }
>(function ExamsField(
  { value, onChange, allowedCodes = EXAM_CODES },
  ref,
) {
  const [code, setCode] = useState<ExamCode>(allowedCodes[0] ?? "UNT");
  const [score, setScore] = useState("");
  const [status, setStatus] = useState<ExamStatus>("planned");
  const [date, setDate] = useState("");
  const [subject, setSubject] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const needsSubject = EXAMS_WITH_OPTIONAL_SUBJECT.has(code);
  const isALevel = code === "A_LEVEL";

  function applyCommit(
    result: { ok: true; exams: ExamEntry[] } | { ok: false; error: string },
  ) {
    if (!result.ok) {
      setFormError(result.error);
      return result;
    }
    setFormError(null);
    if (result.exams !== value) {
      onChange(result.exams);
      setScore("");
      setSubject("");
      setDate("");
      setStatus("planned");
    }
    return result;
  }

  useImperativeHandle(ref, () => ({
    commitPending() {
      return applyCommit(
        commitPendingExam(value, {
          code,
          scoreRaw: score,
          status,
          date,
          subject,
        }),
      );
    },
  }));

  function addExam() {
    applyCommit(
      commitPendingExam(value, {
        code,
        scoreRaw: score,
        status,
        date,
        subject,
      }),
    );
  }

  function removeAt(index: number) {
    onChange(value.filter((_, current) => current !== index));
  }

  const visible = value.filter((entry) => allowedCodes.includes(entry.code));

  return (
    <div className="flex flex-col gap-4">
      {visible.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {visible.map((entry, index) => {
            const globalIndex = value.indexOf(entry);
            return (
              <li
                key={`${entry.code}-${entry.subject ?? ""}-${index}`}
                className="flex min-h-11 items-center justify-between gap-3 rounded-xl border px-3 py-2"
              >
                <span className="text-sm">
                  {formatExamEntry(entry)} ·{" "}
                  {entry.status === "taken"
                    ? strings.profile.exam.taken
                    : strings.profile.exam.planned}
                  {entry.date ? ` · ${entry.date}` : ""}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeAt(globalIndex)}
                >
                  {strings.profile.exam.remove}
                </Button>
              </li>
            );
          })}
        </ul>
      ) : null}

      <div className="grid gap-3 rounded-xl border p-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="exam-code">{strings.profile.exam.code}</Label>
          <select
            id="exam-code"
            className="h-11 min-h-11 w-full rounded-lg border border-input bg-transparent px-2.5 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            value={code}
            onChange={(event) => {
              setCode(event.target.value as ExamCode);
              setScore("");
            }}
          >
            {allowedCodes.map((item) => (
              <option key={item} value={item}>
                {getExamCodeLabel(item)}
              </option>
            ))}
          </select>
        </div>

        {isALevel ? (
          <div className="flex flex-col gap-2">
            <Label htmlFor="exam-grade">{strings.profile.exam.grade}</Label>
            <select
              id="exam-grade"
              className="h-11 min-h-11 w-full rounded-lg border border-input bg-transparent px-2.5 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              value={score}
              onChange={(event) => setScore(event.target.value)}
            >
              <option value="">—</option>
              {A_LEVEL_GRADES.map((grade) => (
                <option key={grade} value={grade}>
                  {grade}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <Label htmlFor="exam-score">{strings.profile.exam.score}</Label>
            <Input
              id="exam-score"
              className="h-11 min-h-11"
              type="number"
              inputMode="decimal"
              value={score}
              onChange={(event) => setScore(event.target.value)}
            />
          </div>
        )}

        {needsSubject ? (
          <div className="flex flex-col gap-2">
            <Label htmlFor="exam-subject">{strings.profile.exam.subject}</Label>
            <Input
              id="exam-subject"
              className="h-11 min-h-11"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
            />
          </div>
        ) : null}

        <div
          role="radiogroup"
          aria-label={strings.profile.exam.status}
          className="grid grid-cols-2 gap-3"
        >
          {STATUS_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={status === option.value}
              className={`min-h-11 rounded-xl border px-3 text-sm font-medium focus-visible:ring-3 focus-visible:ring-ring/50 ${
                status === option.value ? "border-primary bg-accent" : ""
              }`}
              onClick={() => setStatus(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="exam-date">{strings.profile.exam.date}</Label>
          <Input
            id="exam-date"
            className="h-11 min-h-11"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
        </div>

        {formError ? (
          <p role="alert" className="text-sm text-destructive">
            {formError}
          </p>
        ) : null}

        <Button type="button" variant="outline" className="min-h-11" onClick={addExam}>
          {strings.profile.exam.add}
        </Button>
      </div>
    </div>
  );
});
