"use client";

import { useState } from "react";

import { ComparePicker } from "@/components/pathway/compare/ComparePicker";
import { CompareTable } from "@/components/pathway/compare/CompareTable";
import type { FitCategory, FitResult, FitUniversity } from "@/lib/matching/types";

type CompareItem = {
  category: FitCategory;
  university: FitUniversity & { fit: FitResult };
};

export function CompareLive({
  options,
  initialIds,
  items,
  today,
}: {
  options: { id: string; name: string }[];
  initialIds: string[];
  items: CompareItem[];
  today: string;
}) {
  const [picked, setPicked] = useState(initialIds);
  const selected = picked
    .map((id) => items.find((item) => item.university.id === id))
    .filter((item): item is CompareItem => Boolean(item));

  return (
    <>
      <ComparePicker options={options} selectedIds={picked} onChange={setPicked} />
      {selected.length >= 2 ? <CompareTable items={selected} today={today} /> : null}
    </>
  );
}
