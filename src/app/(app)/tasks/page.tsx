import type { Metadata } from "next";

import { WeeklyGoalForm } from "@/components/pathway/dashboard/WeeklyGoalForm";
import { TaskComposer } from "@/components/pathway/tasks/TaskComposer";
import { TaskList } from "@/components/pathway/tasks/TaskList";
import { Books } from "@/components/pathway/ui/illustrations";
import { EmptyCta, PageHeader } from "@/components/pathway/ui/tropa";
import { getSettings, getTasks } from "@/lib/data";
import { strings } from "@/lib/strings";

export const metadata: Metadata = {
  title: `${strings.tasks.title} — ${strings.app.name}`,
};

export default async function TasksPage() {
  const [{ items, error_ru }, settings] = await Promise.all([getTasks(), getSettings()]);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title={strings.tasks.title} illustration={<Books className="w-full" />} />
      <WeeklyGoalForm weeklyGoal={settings.weeklyGoal} />
      <TaskComposer />
      {error_ru ? (
        <p role="alert" className="rounded-[20px] bg-danger-soft px-4 py-3 text-[14px] font-semibold text-destructive">
          {error_ru}
        </p>
      ) : items.length === 0 ? (
        <EmptyCta title={strings.tasks.empty} cta={strings.tasks.emptyCta} href="/roadmap" />
      ) : (
        <TaskList items={items} />
      )}
    </div>
  );
}
