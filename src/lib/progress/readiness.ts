import { computeProfileCompleteness } from "@/lib/profile/completeness";
import type { Cv, ProfileData } from "@/lib/profile/types";
import { shiftUtcDays, toUtcDateString, utcWeekRange } from "@/lib/matching/dates";
import type { PrepPlan } from "@/lib/prep/plan";

export const READINESS_WEIGHTS = {
  profile: 25,
  exams: 25,
  shortlist: 20,
  roadmap: 20,
  cv: 10,
} as const;

export type ReadinessKey = keyof typeof READINESS_WEIGHTS;

export type ReadinessPart = {
  key: ReadinessKey;
  label_ru: string;
  weight: number;
  percent: number | null;
};

export type AchievementId =
  | "first_shortlist"
  | "profile_complete"
  | "first_task_done"
  | "streak_7";

export type Achievement = {
  id: AchievementId;
  title_ru: string;
  unlocked: boolean;
};

export type ProgressTask = {
  due_date: string | null;
  status: "todo" | "in_progress" | "done";
  source: "roadmap" | "agent" | "manual";
};

export type WeeklyGoalProgress = {
  goal: number | null;
  due: number;
  done: number;
};

export type WeeklySummary = {
  weekStart: string;
  weekEnd: string;
  tasksDue: number;
  tasksDone: number;
  readinessPercent: number | null;
  achievementsUnlocked: AchievementId[];
};

export type ProgressReport = {
  readiness: {
    percent: number | null;
    parts: Record<ReadinessKey, ReadinessPart>;
  };
  weeklyGoal: WeeklyGoalProgress;
  streak: number | null;
  achievements: Achievement[];
  weeklySummary: WeeklySummary;
};

const LABELS: Record<ReadinessKey, string> = {
  profile: "Профиль",
  exams: "Экзамены",
  shortlist: "Список вузов",
  roadmap: "Задачи дорожной карты",
  cv: "CV",
};

const CV_FIELDS = 6;

export function cvCompleteness(cv: Cv | null | undefined): number | null {
  if (!cv) return null;
  let filled = 0;
  if (cv.summary.trim()) filled += 1;
  if (cv.skills.some((skill) => skill.trim())) filled += 1;
  if (cv.languages.some((language) => language.name.trim())) filled += 1;
  if (cv.contacts.phone.trim()) filled += 1;
  if (cv.contacts.city.trim()) filled += 1;
  if (cv.education.institution.trim()) filled += 1;
  return Math.round((filled / CV_FIELDS) * 100);
}

export function examReadiness(plan: PrepPlan | null): number | null {
  if (!plan) return null;
  const targeted = plan.exams.filter((exam) => exam.target != null);
  if (targeted.length === 0) return null;
  const met = targeted.filter(
    (exam) => exam.current != null && exam.current >= exam.target,
  ).length;
  return Math.round((met / targeted.length) * 100);
}

export function shortlistReadiness(count: number | null): number | null {
  if (count == null) return null;
  return Math.round((Math.min(count, 3) / 3) * 100);
}

export function roadmapReadiness(tasks: ProgressTask[] | null): number | null {
  if (!tasks) return null;
  const roadmap = tasks.filter((task) => task.source === "roadmap");
  if (roadmap.length === 0) return null;
  const done = roadmap.filter((task) => task.status === "done").length;
  return Math.round((done / roadmap.length) * 100);
}

export function computeReadiness(parts: Record<ReadinessKey, number | null>): {
  percent: number | null;
  parts: Record<ReadinessKey, ReadinessPart>;
} {
  let weighted = 0;
  let weight = 0;
  const detailed = {} as Record<ReadinessKey, ReadinessPart>;
  for (const key of Object.keys(READINESS_WEIGHTS) as ReadinessKey[]) {
    const percent = parts[key];
    const partWeight = READINESS_WEIGHTS[key];
    detailed[key] = {
      key,
      label_ru: LABELS[key],
      weight: partWeight,
      percent,
    };
    if (percent == null) continue;
    weighted += percent * partWeight;
    weight += partWeight;
  }
  return {
    percent: weight === 0 ? null : Math.round(weighted / weight),
    parts: detailed,
  };
}

export function weeklyGoalProgress(
  tasks: ProgressTask[],
  today: string,
  goal: number | null,
): WeeklyGoalProgress {
  const week = utcWeekRange(today);
  const due = tasks.filter((task) => {
    const date = task.due_date?.slice(0, 10);
    return Boolean(date && date >= week.start && date <= week.end);
  });
  return {
    goal,
    due: due.length,
    done: due.filter((task) => task.status === "done").length,
  };
}

export function computeStreak(days: string[] | null, today: string): number | null {
  if (!days) return null;
  const set = new Set(days.map((day) => day.slice(0, 10)));
  let cursor = today;
  if (!set.has(cursor)) {
    const yesterday = shiftUtcDays(today, -1);
    if (!set.has(yesterday)) return 0;
    cursor = yesterday;
  }
  let streak = 0;
  while (set.has(cursor)) {
    streak += 1;
    cursor = shiftUtcDays(cursor, -1);
  }
  return streak;
}

export function deriveAchievements(input: {
  shortlistCount: number;
  profilePercent: number | null;
  tasksDone: number;
  streak: number | null;
}): Achievement[] {
  return [
    {
      id: "first_shortlist",
      title_ru: "Первый вуз в списке",
      unlocked: input.shortlistCount >= 1,
    },
    {
      id: "profile_complete",
      title_ru: "Профиль заполнен",
      unlocked: input.profilePercent === 100,
    },
    {
      id: "first_task_done",
      title_ru: "Первая задача закрыта",
      unlocked: input.tasksDone >= 1,
    },
    {
      id: "streak_7",
      title_ru: "Серия 7 дней",
      unlocked: (input.streak ?? 0) >= 7,
    },
  ];
}

export function buildProgress(input: {
  profile: ProfileData;
  prep: PrepPlan | null;
  shortlistCount: number | null;
  tasks: ProgressTask[] | null;
  activityDays: string[] | null;
  weeklyGoal: number | null;
  today?: Date | string;
}): ProgressReport {
  const today = toUtcDateString(input.today ?? new Date());
  const profilePercent = computeProfileCompleteness(input.profile).percent;
  const readiness = computeReadiness({
    profile: profilePercent,
    exams: examReadiness(input.prep),
    shortlist: shortlistReadiness(input.shortlistCount),
    roadmap: roadmapReadiness(input.tasks),
    cv: cvCompleteness(input.profile.cv),
  });
  const tasks = input.tasks ?? [];
  const weeklyGoal = weeklyGoalProgress(tasks, today, input.weeklyGoal);
  const streak = computeStreak(input.activityDays, today);
  const achievements = deriveAchievements({
    shortlistCount: input.shortlistCount ?? 0,
    profilePercent,
    tasksDone: tasks.filter((task) => task.status === "done").length,
    streak,
  });
  const week = utcWeekRange(today);
  return {
    readiness,
    weeklyGoal,
    streak,
    achievements,
    weeklySummary: {
      weekStart: week.start,
      weekEnd: week.end,
      tasksDue: weeklyGoal.due,
      tasksDone: weeklyGoal.done,
      readinessPercent: readiness.percent,
      achievementsUnlocked: achievements.filter((item) => item.unlocked).map((item) => item.id),
    },
  };
}
