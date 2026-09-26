import { notFound } from "next/navigation";

import { DashboardScreen } from "@/components/pathway/dashboard/DashboardScreen";
import { DeadlinesTickets } from "@/components/pathway/dashboard/DeadlinesTickets";
import { DocumentsBackpack } from "@/components/pathway/dashboard/DocumentsBackpack";
import { PopularUniversities } from "@/components/pathway/dashboard/PopularUniversities";
import { ProfileStrengthRing } from "@/components/pathway/dashboard/ProfileStrengthRing";
import { ErrorState } from "@/components/pathway/primitives/States";
import { emptyDashboard, exampleDashboard } from "@/fixtures/tropa";

export default async function StatesGallery({
  searchParams,
}: {
  searchParams: Promise<{ v?: string }>;
}) {
  if (process.env.NODE_ENV === "production") notFound();
  const { v } = await searchParams;
  if (v === "example") {
    return (
      <div className="p-6">
        <DashboardScreen data={exampleDashboard} />
      </div>
    );
  }
  if (v === "empty") {
    return (
      <div className="p-6">
        <DashboardScreen data={emptyDashboard} />
      </div>
    );
  }
  return (
    <div className="mx-auto grid max-w-[1100px] gap-4 p-8 md:grid-cols-3">
      <p className="text-[14px] font-bold md:col-span-3">
        ?v=example · ?v=empty — полные дашборды. Ниже — загрузка и ошибка.
      </p>
      <ProfileStrengthRing data={null} loading />
      <PopularUniversities unis={null} loading />
      <DeadlinesTickets items={null} today="2026-09-26" loading />
      <DocumentsBackpack docs={null} loading />
      <div className="md:col-span-2">
        <ErrorState title="Не получилось загрузить вузы." />
      </div>
    </div>
  );
}
