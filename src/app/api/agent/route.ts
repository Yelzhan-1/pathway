import {
  createUIMessageStreamResponse,
  isStepCount,
  streamText,
  toUIMessageStream,
  type ModelMessage,
} from "ai";

import { agentErrorText, logAgentError } from "@/lib/agent/errors";
import { agentModelId } from "@/lib/agent/model";
import {
  asksForUniversityMatches,
  cardDetailRu,
  fitCategoryRu,
  forcedToolChoice,
  generalQuestionStep,
  historyForCurrentUniversity,
  profileMatchContext,
  universityFactsContext,
  universityNamedInMessage,
  wantsGrantMatches,
} from "@/lib/agent/forced-lookup";
import { historyForModel, partsToJson, textFromParts } from "@/lib/agent/messages";
import { AGENT_SYSTEM_PROMPT } from "@/lib/agent/prompt";
import { englishRequirementLabel } from "@/lib/agent/university-facts";
import { aidLabel, roundLabel } from "@/lib/labels/display";
import { loadShortlist, loadUniversities, loadUniversity } from "@/lib/data/load";
import { toUtcDateString } from "@/lib/matching/dates";
import { earliestUpcoming } from "@/lib/matching/deadlines";
import { parseProfile } from "@/lib/profile/parse";
import {
  AGENT_RATE_LIMIT_MESSAGE_RU,
  isOverAgentRateLimit,
} from "@/lib/agent/rate-limit";
import { agentUserMessageSchema } from "@/lib/actions/schemas";
import { createAgentTools } from "@/lib/agent/tools";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 60;

const SIGN_IN_RU = "Войдите, чтобы пользоваться помощником.";

function lastUserText(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;
  const record = body as { message?: unknown; messages?: unknown };
  if (Array.isArray(record.messages)) {
    for (let index = record.messages.length - 1; index >= 0; index -= 1) {
      const message = record.messages[index];
      if (!message || typeof message !== "object") continue;
      const row = message as { role?: unknown; content?: unknown; parts?: unknown };
      if (row.role !== "user") continue;
      if (typeof row.content === "string" && row.content.trim()) return row.content;
      const fromParts = textFromParts(row.parts);
      if (fromParts) return fromParts;
    }
  }
  return typeof record.message === "string" ? record.message : null;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: SIGN_IN_RU }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Некорректный запрос." }, { status: 400 });
  }

  const parsed = agentUserMessageSchema.safeParse({ message: lastUserText(body) ?? "" });
  if (!parsed.success) {
    return Response.json({ error: "Введите сообщение до 4000 символов." }, { status: 400 });
  }

  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count, error: countError } = await supabase
    .from("agent_messages")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("role", "user")
    .gte("created_at", since);
  if (countError) {
    return Response.json({ error: "Не удалось проверить лимит." }, { status: 500 });
  }
  if (isOverAgentRateLimit(count ?? 0)) {
    return Response.json({ error: AGENT_RATE_LIMIT_MESSAGE_RU }, { status: 429 });
  }

  const { data: history, error: historyError } = await supabase
    .from("agent_messages")
    .select("role, content")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);
  if (historyError) {
    return Response.json({ error: "Не удалось загрузить историю." }, { status: 500 });
  }

  const { data: catalog } = await supabase.from("universities").select("slug, name");
  const catalogRows = catalog ?? [];
  const named = universityNamedInMessage(parsed.data.message, catalogRows);
  const matchQuestion = asksForUniversityMatches(parsed.data.message, catalogRows);
  const messages: ModelMessage[] = [
    ...historyForCurrentUniversity(
      historyForModel(
        (history ?? []).slice().reverse().map((row) => ({ role: row.role, content: row.content })),
      ),
      parsed.data.message,
      catalogRows,
    ),
    { role: "user", content: parsed.data.message },
  ];

  let system = AGENT_SYSTEM_PROMPT;
  if (named) {
    const { item } = await loadUniversity(supabase, user.id, named.slug);
    if (item) {
      system = `${AGENT_SYSTEM_PROMPT}\n\n${universityFactsContext({
        name: item.name,
        slug: item.slug,
        sourceUrl: item.source_url,
        ieltsMin: item.ielts_min,
        toeflMin: item.toefl_min,
        duolingoMin: item.duolingo_min,
        englishRequirementRu: englishRequirementLabel(item.fit),
        orientationRu: null,
      })}`;
    }
  } else if (matchQuestion) {
    const grantOnly = wantsGrantMatches(parsed.data.message);
    const [profileRow, shortlist, universities] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      loadShortlist(supabase, user.id),
      loadUniversities(supabase, user.id, grantOnly ? { freeOrGrantOnly: true } : {}),
    ]);
    const profile = profileRow.data ? parseProfile(profileRow.data) : null;
    const today = toUtcDateString(new Date());
    const detailFor = (
      fit: Parameters<typeof englishRequirementLabel>[0],
      deadlines: Parameters<typeof earliestUpcoming>[0],
    ) =>
      cardDetailRu({
        englishRu: englishRequirementLabel(fit),
        deadlineRu: (() => {
          const next = earliestUpcoming(deadlines, today);
          return next ? `дедлайн ${roundLabel(next.round)} ${next.date}` : null;
        })(),
      });
    const grantFor = (aid: string | null, tuition: number | null) =>
      aidLabel(aid) ?? (tuition === 0 ? "бесплатное обучение" : "грант не указан");
    system = `${AGENT_SYSTEM_PROMPT}\n\n${profileMatchContext({
      grantOnly,
      profile: {
        intendedMajor: profile?.intended_major ?? null,
        budgetUsd: profile?.budget_usd ?? null,
        needsScholarship: profile?.needs_scholarship ?? false,
        exams: (profile?.exams ?? [])
          .filter((exam) => exam.status === "taken")
          .map((exam) => ({ code: exam.code, score: String(exam.score) })),
      },
      shortlist: shortlist.items.map((item) => ({
        name: item.university.name,
        categoryRu: fitCategoryRu(item.category),
        grantRu: grantFor(item.university.aid_for_internationals, item.university.tuition_usd_per_year),
        detailRu: detailFor(item.fit, item.university.deadlines),
      })),
      matches: universities.items.map((item) => ({
        name: item.name,
        categoryRu: fitCategoryRu(item.fit.suggestedCategory),
        grantRu: grantFor(item.aid_for_internationals, item.tuition_usd_per_year),
        detailRu: detailFor(item.fit, item.deadlines),
      })),
    })}`;
  }

  const answerOnly = generalQuestionStep(matchQuestion);

  try {
    let failed = false;

    const result = streamText({
      model: agentModelId(),
      system,
      messages,
      tools: answerOnly ? undefined : createAgentTools(supabase, user.id),
      toolChoice: answerOnly?.toolChoice,
      prepareStep: answerOnly
        ? undefined
        : ({ stepNumber }) => {
            const toolChoice = forcedToolChoice(stepNumber, named?.slug ?? null);
            return toolChoice ? { toolChoice } : {};
          },
      stopWhen: isStepCount(6),
      onError({ error }) {
        failed = true;
        logAgentError(error);
      },
    });

    const uiStream = toUIMessageStream({
      stream: result.stream,
      onError: (error) => {
        failed = true;
        logAgentError(error);
        return agentErrorText(error);
      },
      onFinish: async ({ responseMessage }) => {
        if (failed) return;
        const content = textFromParts(responseMessage.parts).trim();
        if (!content || content === "…") return;
        const { error: insertError } = await supabase.from("agent_messages").insert([
          {
            user_id: user.id,
            role: "user",
            content: parsed.data.message,
            parts: [{ type: "text", text: parsed.data.message }],
          },
          {
            user_id: user.id,
            role: "assistant",
            content,
            parts: partsToJson(responseMessage.parts),
          },
        ]);
        if (insertError) console.error("agent persist", insertError);
      },
    });

    return createUIMessageStreamResponse({ stream: uiStream });
  } catch (error) {
    logAgentError(error);
    return Response.json({ error: agentErrorText(error) }, { status: 503 });
  }
}
