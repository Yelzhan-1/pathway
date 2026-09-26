import { firstZodMessage } from "@/lib/profile/zod-error";
import { strings } from "@/lib/strings";

import {
  EXAMS_WITH_OPTIONAL_SUBJECT,
  type ExamCode,
} from "./exam-ranges";
import { examEntrySchema } from "./schemas";
import type { ExamEntry, ExamStatus } from "./types";

export function parseScoreInput(
  raw: string,
  isALevel: boolean,
): string | number | undefined {
  const trimmed = raw.trim();
  if (trimmed === "") return undefined;
  if (isALevel) return trimmed;
  const value = Number(trimmed);
  if (!Number.isFinite(value)) return undefined;
  return value;
}

export function isPendingExamEmpty(draft: {
  scoreRaw: string;
  date: string;
  subject: string;
  status: ExamStatus;
}): boolean {
  return (
    draft.scoreRaw.trim() === "" &&
    draft.date === "" &&
    draft.subject.trim() === "" &&
    draft.status === "planned"
  );
}

export function commitPendingExam(
  current: ExamEntry[],
  draft: {
    code: ExamCode;
    scoreRaw: string;
    status: ExamStatus;
    date: string;
    subject: string;
  },
): { ok: true; exams: ExamEntry[] } | { ok: false; error: string } {
  if (isPendingExamEmpty(draft)) {
    return { ok: true, exams: current };
  }

  const isALevel = draft.code === "A_LEVEL";
  const needsSubject = EXAMS_WITH_OPTIONAL_SUBJECT.has(draft.code);
  const score = parseScoreInput(draft.scoreRaw, isALevel);
  if (score === undefined) {
    return { ok: false, error: strings.profile.errors.examPending };
  }

  const parsed = examEntrySchema.safeParse({
    code: draft.code,
    score,
    status: draft.status,
    date: draft.date || null,
    subject: needsSubject ? draft.subject.trim() || null : null,
  });
  if (!parsed.success) {
    return { ok: false, error: firstZodMessage(parsed.error) };
  }
  return { ok: true, exams: [...current, parsed.data as ExamEntry] };
}
