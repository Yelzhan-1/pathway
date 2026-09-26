"use client";
import { useId } from "react";
import { motion } from "motion/react";

import { usePrefs } from "@/lib/prefs";

/**
 * Overall essay score ring (1–10), separate from the shared `Ring` primitive since that one
 * always renders a 0–100 percentage with a «%» suffix and a «Готовность …%» aria-label —
 * not the right shape for a 1–10 letter score.
 */
export function ScoreRing({ value, size = 128, stroke = 12 }: { value: number; size?: number; stroke?: number }) {
  const { reduced } = usePrefs();
  const id = "esr" + useId().replace(/:/g, "");
  const sw = stroke / (size / 100);
  const r = 50 - sw / 2;
  const fraction = Math.max(0, Math.min(1, value / 10));
  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Балл письма ${value} из 10`}
    >
      <svg viewBox="0 0 100 100" className="size-full -rotate-90" aria-hidden>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--color-forest-400)" />
            <stop offset="100%" stopColor="var(--primary)" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--secondary)" strokeWidth={sw} />
        <motion.circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke={`url(#${id})`}
          strokeWidth={sw}
          strokeLinecap="round"
          initial={{ pathLength: reduced ? fraction : 0 }}
          animate={{ pathLength: fraction }}
          transition={{ type: "spring", stiffness: 38, damping: 16, delay: reduced ? 0 : 0.2 }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center" aria-hidden>
        <div className="flex items-baseline gap-0.5">
          <span className="text-[36px] font-extrabold leading-none tracking-[-0.04em]">{value}</span>
          <span className="text-[15px] font-bold text-muted-foreground">/10</span>
        </div>
      </div>
    </div>
  );
}
