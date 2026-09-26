import { tool } from "ai";

import type { DbClient } from "@/lib/actions/activity";
import {
  addToShortlistForUser,
  createTaskForUser,
  deleteTaskForUser,
  removeFromShortlistForUser,
  updateTaskStatusForUser,
} from "@/lib/actions/mutate";
import {
  loadExam,
  loadOpportunities,
  loadPrepPlan,
  loadTasks,
  loadUniversities,
  loadUniversity,
  type UniversityWithFit,
} from "@/lib/data/load";
import { toFitProfile } from "@/lib/data/map";
import { toUtcDateString } from "@/lib/matching/dates";
import { shortestPath } from "@/lib/matching/path";
import { isLastCycleNote } from "@/lib/matching/deadlines";
import { displayCost, displayTitle, publicNote, roundLabel } from "@/lib/labels/display";
import type { FitResult } from "@/lib/matching/types";
import { parseCv, parseProfile } from "@/lib/profile/parse";

import { reviewCv } from "./cv-review";
import { NOT_IN_DATABASE_RU } from "./prompt";
import { englishRequirementLabel } from "./university-facts";
import {
  addShortlistInputSchema,
  createAgentTaskInputSchema,
  deleteAgentTaskInputSchema,
  emptyInputSchema,
  examCodeInputSchema,
  removeShortlistInputSchema,
  searchOpportunitiesInputSchema,
  searchUniversitiesInputSchema,
  universityLookupInputSchema,
  universityNamesFromInput,
  universitySlugInputSchema,
  updateAgentTaskInputSchema,
} from "./schemas";

function universityCard(item: UniversityWithFit, today: string) {
  return {
    found: true as const,
    name: item.name,
    slug: item.slug,
    country: item.country,
    city: item.city,
    majors: item.majors,
    tuition_usd_per_year: item.tuition_usd_per_year,
    tuition_note: publicNote(item.tuition_note),
    aid_for_internationals: item.aid_for_internationals,
    scholarships: publicNote(item.scholarships),
    acceptance_rate: item.acceptance_rate,
    ielts_min: item.ielts_min,
    toefl_min: item.toefl_min,
    duolingo_min: item.duolingo_min,
    unt_min: item.unt_min,
    sat_policy: item.sat_policy,
    sat_total_min: item.sat_total_min,
    sat_total_max: item.sat_total_max,
    english_requirement_ru: englishRequirementLabel(item.fit),
    requirements: item.requirements,
    deadlines: item.deadlines.map((deadline) => ({
      round: roundLabel(deadline.round),
      date: deadline.date,
      note: publicNote(deadline.note),
      lastCycle: deadline.date < today && isLastCycleNote(deadline.note),
      warning_ru:
        deadline.date < today && isLastCycleNote(deadline.note)
          ? "по прошлому циклу — проверьте на сайте вуза"
          : null,
    })),
    source_url: item.source_url,
    extra_sources: item.extra_sources,
    last_verified: item.last_verified,
    source_type: item.source_type,
    website_url: item.website_url,
    fit: fitPayload(item.fit),
  };
}

function fitPayload(fit: FitResult) {
  return {
    label_ru: "соответствие требованиям",
    score: fit.score,
    suggestedCategory: fit.suggestedCategory,
    checks: fit.checks,
    gaps: fit.gaps,
  };
}

export function createAgentTools(supabase: DbClient, userId: string) {
  const today = toUtcDateString(new Date());

  return {
    getMyProfile: tool({
      description: "Профиль текущего пользователя: класс, страны, бюджет, GPA, экзамены.",
      inputSchema: emptyInputSchema,
      execute: async () => {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .maybeSingle();
        if (error || !data) return { found: false, message_ru: NOT_IN_DATABASE_RU };
        const profile = parseProfile(data);
        return {
          found: true,
          profile,
          weeklyGoal: data.weekly_goal,
          freeOnly: data.free_only,
        };
      },
    }),
    searchUniversities: tool({
      description: "Поиск вузов в базе Pathway с оценкой соответствия требованиям.",
      inputSchema: searchUniversitiesInputSchema,
      execute: async (input) => {
        const query = Array.isArray(input.query) ? undefined : input.query;
        const { items, error_ru } = await loadUniversities(
          supabase,
          userId,
          {
            region: input.region,
            country: input.country,
            major: input.major,
            maxTuition: input.maxTuition,
            freeOrGrantOnly: input.freeOrGrantOnly,
            satPolicy: input.satPolicy,
            query,
          },
          today,
        );
        if (error_ru) return { found: false, message_ru: error_ru };
        const slice = items.slice(0, 8);
        if (slice.length === 0) return { found: false, message_ru: NOT_IN_DATABASE_RU, items: [] };
        return {
          found: true,
          message_ru: Array.isArray(input.query) ? "Несколько имён сразу не фильтр. Вот подборка по профилю." : null,
          items: slice.map((item) => ({
            name: item.name,
            slug: item.slug,
            country: item.country,
            city: item.city,
            tuition_usd_per_year: item.tuition_usd_per_year,
            aid_for_internationals: item.aid_for_internationals,
            source_url: item.source_url,
            fit: fitPayload(item.fit),
          })),
        };
      },
    }),
    getUniversityDetails: tool({
      description:
        "Карточка одного вуза по имени или slug. Если пришло несколько имён, верни карточку на каждое, без ошибки. english_requirement_ru — то же требование IELTS/TOEFL, что на странице вуза. «Нет данных» значит минимум не опубликован, вуз при этом найден.",
      inputSchema: universityLookupInputSchema,
      execute: async (input) => {
        const names = universityNamesFromInput(input);
        if (names.length === 0) return { found: false, message_ru: "Назови один вуз." };
        const cards = [];
        for (const slug of names) {
          const { item, error_ru } = await loadUniversity(supabase, userId, slug, today);
          if (error_ru) {
            cards.push({ found: false, slug, message_ru: error_ru });
            continue;
          }
          if (!item) {
            cards.push({ found: false, slug, message_ru: NOT_IN_DATABASE_RU });
            continue;
          }
          cards.push(universityCard(item, today));
        }
        if (cards.length === 1) return cards[0];
        return { found: cards.some((card) => card.found), items: cards };
      },
    }),
    checkFit: tool({
      description: "Соответствие требованиям вуза по slug. Это не шанс поступления.",
      inputSchema: universitySlugInputSchema,
      execute: async ({ slug }) => {
        const { item, error_ru } = await loadUniversity(supabase, userId, slug, today);
        if (error_ru) return { found: false, message_ru: error_ru };
        if (!item) return { found: false, message_ru: NOT_IN_DATABASE_RU };
        return {
          found: true,
          name: item.name,
          source_url: item.source_url,
          fit: fitPayload(item.fit),
        };
      },
    }),
    shortest_path: tool({
      description:
        "Кратчайший путь в вуз: какие баллы поднять, чтобы категория стала на шаг лучше (Мечта → Цель или Цель → Запасной). Не шанс поступления.",
      inputSchema: universitySlugInputSchema,
      execute: async ({ slug }) => {
        const { item, error_ru } = await loadUniversity(supabase, userId, slug, today);
        if (error_ru) return { found: false, message_ru: error_ru };
        if (!item) return { found: false, message_ru: NOT_IN_DATABASE_RU };
        const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
        if (error || !data) return { found: false, message_ru: NOT_IN_DATABASE_RU };
        const path = shortestPath(toFitProfile(parseProfile(data)), item, today);
        return {
          found: true,
          name: item.name,
          slug: item.slug,
          from: path.from,
          goal: path.goal,
          reason_ru: path.reason_ru,
          combos: path.combos.map((combo) => ({
            weeks: combo.weeks,
            category: combo.category,
            score: combo.score,
            levers: combo.levers.map((lever) => ({
              label_ru: lever.label_ru,
              from: lever.from,
              to: lever.to,
              weeks: lever.weeks,
            })),
          })),
        };
      },
    }),
    searchOpportunities: tool({
      description: "Поиск олимпиад, программ, стажировок и стипендий в базе.",
      inputSchema: searchOpportunitiesInputSchema,
      execute: async (input) => {
        const { items, error_ru } = await loadOpportunities(supabase, userId, input, today);
        if (error_ru) return { found: false, message_ru: error_ru };
        const slice = items.slice(0, 8);
        if (slice.length === 0) return { found: false, message_ru: NOT_IN_DATABASE_RU, items: [] };
        return {
          found: true,
          items: slice.map((item) => ({
            title: displayTitle(item.title),
            slug: item.slug,
            type: item.type,
            deadline: item.deadline,
            deadline_note: publicNote(item.deadline_note),
            cost: displayCost(item.cost),
            format: item.format,
            grades: item.grades,
            url: item.url,
            source_url: item.source_url,
          })),
        };
      },
    }),
    getExamInfo: tool({
      description: "Справочная карточка экзамена из базы: шкала, даты, официальная ссылка.",
      inputSchema: examCodeInputSchema,
      execute: async ({ code }) => {
        const { exam, error_ru } = await loadExam(supabase, code);
        if (error_ru) return { found: false, message_ru: error_ru };
        if (!exam) return { found: false, message_ru: NOT_IN_DATABASE_RU };
        return {
          found: true,
          code: exam.code,
          name: exam.name,
          description: exam.description,
          score_scale: exam.score_scale,
          typical_test_dates_note: exam.typical_test_dates_note,
          cost_note: exam.cost_note,
          validity_note: exam.validity_note,
          official_url: exam.official_url,
          source_url: exam.source_url,
          last_verified: exam.last_verified,
        };
      },
    }),
    getPrepPlan: tool({
      description: "Шаблонный план подготовки по требованиям шортлиста. Это не совет модели.",
      inputSchema: emptyInputSchema,
      execute: async () => {
        const { plan, error_ru } = await loadPrepPlan(supabase, userId, today);
        if (error_ru || !plan) return { found: false, message_ru: error_ru ?? NOT_IN_DATABASE_RU };
        if (plan.exams.length === 0) return { found: false, message_ru: NOT_IN_DATABASE_RU, plan };
        return { found: true, plan };
      },
    }),
    listMyTasks: tool({
      description: "Задачи пользователя.",
      inputSchema: emptyInputSchema,
      execute: async () => {
        const { items, error_ru } = await loadTasks(supabase, userId);
        if (error_ru) return { found: false, message_ru: error_ru };
        return {
          found: items.length > 0,
          message_ru: items.length === 0 ? NOT_IN_DATABASE_RU : null,
          tasks: items.map((task) => ({
            id: task.id,
            title: task.title,
            description: task.description,
            due_date: task.due_date,
            status: task.status,
            source: task.source,
          })),
        };
      },
    }),
    createTask: tool({
      description:
        "Создаёт задачу пользователя (source=agent). Сначала скажи, какую задачу создаёшь. Отмена: deleteTask.",
      inputSchema: createAgentTaskInputSchema,
      execute: async (input) => {
        const result = await createTaskForUser(supabase, userId, input, "agent");
        return { ...result, reversible: true, undo: "deleteTask" };
      },
    }),
    updateTaskStatus: tool({
      description: "Меняет статус своей задачи. Сначала скажи, какой статус поставишь.",
      inputSchema: updateAgentTaskInputSchema,
      execute: async (input) => updateTaskStatusForUser(supabase, userId, input),
    }),
    deleteTask: tool({
      description: "Удаляет свою задачу. Сначала скажи, какую задачу удаляешь.",
      inputSchema: deleteAgentTaskInputSchema,
      execute: async (input) => deleteTaskForUser(supabase, userId, input),
    }),
    addToShortlist: tool({
      description:
        "Добавляет вуз в список (dream, target или safety). Сначала скажи, какой вуз и в какую категорию. Отмена: removeFromShortlist.",
      inputSchema: addShortlistInputSchema,
      execute: async (input) => {
        const result = await addToShortlistForUser(supabase, userId, input);
        return { ...result, reversible: true, undo: "removeFromShortlist" };
      },
    }),
    removeFromShortlist: tool({
      description: "Убирает вуз из списка пользователя. Сначала скажи, какой вуз убираешь.",
      inputSchema: removeShortlistInputSchema,
      execute: async (input) => removeFromShortlistForUser(supabase, userId, input),
    }),
    reviewMyCv: tool({
      description: "Проверяет CV по правилам (не генерация текста): контакты, описание, навыки, образование.",
      inputSchema: emptyInputSchema,
      execute: async () => {
        const { data, error } = await supabase
          .from("profiles")
          .select("cv")
          .eq("id", userId)
          .maybeSingle();
        if (error || !data) return { found: false, message_ru: NOT_IN_DATABASE_RU };
        return { found: true, review: reviewCv(parseCv(data.cv)) };
      },
    }),
  };
}
