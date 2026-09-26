import type { Metadata } from "next";

import { TaskComposer } from "@/components/pathway/tasks/TaskComposer";
import { TaskList } from "@/components/pathway/tasks/TaskList";
import { Display, EmptyCta } from "@/components/pathway/ui/tropa";
import { getTasks } from "@/lib/data";
import { strings } from "@/lib/strings";

export const metadata: Metadata = {
  title: `${strings.tasks.title} — ${strings.app.name}`,
};

export default async function TasksPage() {
  const { items, error_ru } = await getTasks();

  return (
    <div className="flex flex-col gap-4">
      <Display as="h1" className="text-[28px] font-bold sm:text-[32px]">
        {strings.tasks.title}
      </Display>
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
