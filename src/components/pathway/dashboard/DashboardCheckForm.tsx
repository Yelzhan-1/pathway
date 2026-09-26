"use client";

import { useRouter } from "next/navigation";

import { CheckChancesForm } from "@/components/pathway/dashboard/CheckChancesForm";
import type { CheckChancesOptions } from "@/types/pathway";

export function DashboardCheckForm({ options }: { options: CheckChancesOptions | null }) {
  const router = useRouter();
  return (
    <CheckChancesForm
      options={options}
      onSubmit={(value) => {
        if (value.university) router.push(`/universities/${value.university}`);
      }}
    />
  );
}
