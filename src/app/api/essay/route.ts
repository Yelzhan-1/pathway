import { generateObject } from "ai";

import { agentModelId } from "@/lib/agent/model";
import { loadUniversity } from "@/lib/data/load";
import { essayErrorText, logEssayError } from "@/lib/essay/errors";
import { essayProfileFacts, essayProfileFactsText } from "@/lib/essay/profileFacts";
import { essayUserPrompt, ESSAY_SYSTEM_PROMPT } from "@/lib/essay/prompt";
import { essayRateLimiter, ESSAY_RATE_LIMIT_MESSAGE_RU, isOverEssayRateLimit } from "@/lib/essay/rateLimit";
import { essayAnalysisSchema, essayRequestSchema, sortEssayCriteria } from "@/lib/essay/schema";
import { essayUniversityFacts, essayUniversityFactsText } from "@/lib/essay/universityFacts";
import { parseProfile } from "@/lib/profile/parse";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 60;

const SIGN_IN_RU = "Войдите, чтобы получить разбор письма.";
const UNIVERSITY_NOT_FOUND_RU = "Вуз не найден. Выбери другой.";
const BAD_REQUEST_RU = "Некорректный запрос.";

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
    return Response.json({ error: BAD_REQUEST_RU }, { status: 400 });
  }

  const parsed = essayRequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Проверь введённые данные." },
      { status: 400 },
    );
  }

  if (isOverEssayRateLimit(essayRateLimiter.recentCount(user.id))) {
    return Response.json({ error: ESSAY_RATE_LIMIT_MESSAGE_RU }, { status: 429 });
  }

  const [{ item: university }, profileRow] = await Promise.all([
    loadUniversity(supabase, user.id, parsed.data.universitySlug),
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
  ]);
  if (!university) {
    return Response.json({ error: UNIVERSITY_NOT_FOUND_RU }, { status: 404 });
  }

  const profile = profileRow.data ? parseProfile(profileRow.data) : null;
  const prompt = essayUserPrompt({
    letter: parsed.data.letter,
    universityFactsText: essayUniversityFactsText(essayUniversityFacts(university)),
    profileFactsText: profile ? essayProfileFactsText(essayProfileFacts(profile)) : "Профиль пока пустой.",
  });

  try {
    const { object } = await generateObject({
      model: agentModelId(),
      system: ESSAY_SYSTEM_PROMPT,
      schema: essayAnalysisSchema,
      prompt,
    });
    essayRateLimiter.record(user.id);
    return Response.json({ result: sortEssayCriteria(object) });
  } catch (error) {
    logEssayError(error);
    return Response.json({ error: essayErrorText(error) }, { status: 503 });
  }
}
