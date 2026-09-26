/**
 * Own SVG illustrations (no stock, no licence). Colours via Tailwind fill/stroke classes → follow light/dark.
 * Decorative → aria-hidden.
 */
export function PathHills({ className = '' }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 240 170" className={className} fill="none">
      <circle cx="176" cy="40" r="19" className="fill-honey" opacity=".9" />
      <circle cx="176" cy="40" r="27" className="stroke-honey" strokeWidth="1.5" strokeDasharray="2 5" strokeLinecap="round" opacity=".7" />
      <path d="M126 28q4-4 8 0q4-4 8 0M108 44q3-3 6 0q3-3 6 0" className="stroke-ink-2" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M0 150C40 104 80 94 120 110s58-34 120-44v104H0z" className="fill-forest-100 dark:fill-forest-900" />
      <path d="M0 170v-30c50-22 100-12 140 6s72 4 100-6v30z" className="fill-forest-200 dark:fill-forest-800" />
      <path d="M20 168c38-16 20-34 66-40s26-26 64-30c24-3 32-13 44-22" className="stroke-primary" strokeWidth="2.6" strokeDasharray="5 6" strokeLinecap="round" />
      <path d="M196 80V46" className="stroke-foreground" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M196 46l23 6.5-23 6.5z" className="fill-honey" />
      <g className="fill-forest-500 dark:fill-forest-600"><path d="M36 146l8-20 8 20z" /><path d="M50 150l6-15 6 15z" /><path d="M210 144l6-16 6 16z" /></g>
      <path d="M44 146v6M56 150v5M216 144v5" className="stroke-forest-700 dark:stroke-forest-400" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="20" cy="168" r="4" className="fill-primary" />
    </svg>
  );
}

/** Compass — for «Что если» / decision-support empty states. */
export function Compass({ className = '' }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 100 100" className={className} fill="none">
      <circle cx="50" cy="52" r="34" className="fill-card" stroke="currentColor" strokeWidth="3" />
      <circle cx="50" cy="52" r="26" className="stroke-honey" strokeWidth="1.5" strokeDasharray="2 5" opacity=".8" />
      <path d="M50 52L38 66l6-20 20-6z" className="fill-primary" />
      <circle cx="50" cy="52" r="3" className="fill-honey" />
      <path d="M40 18h20l-4 8H44z" className="fill-forest-500 dark:fill-forest-600" />
    </svg>
  );
}

/** Backpack — for CV/documents empty states. */
export function Backpack({ className = '' }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 100 100" className={className} fill="none">
      <rect x="26" y="34" width="48" height="52" rx="14" className="fill-honey" />
      <rect x="34" y="18" width="32" height="24" rx="10" className="fill-honey" opacity=".9" />
      <rect x="40" y="44" width="20" height="22" rx="6" className="fill-forest-100 dark:fill-forest-900" />
      <path d="M40 34v-8a10 10 0 0 1 20 0v8" className="stroke-forest-700 dark:stroke-forest-300" strokeWidth="3" />
      <circle cx="50" cy="76" r="3.5" className="fill-forest-700 dark:fill-forest-300" />
    </svg>
  );
}

/** Books — for exam/prep empty states. */
export function Books({ className = '' }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 100 100" className={className} fill="none">
      <rect x="16" y="60" width="70" height="12" rx="3" className="fill-forest-600 dark:fill-forest-500" transform="rotate(-3 51 66)" />
      <rect x="20" y="46" width="62" height="14" rx="3" className="fill-honey" transform="rotate(2 51 53)" />
      <rect x="24" y="30" width="52" height="16" rx="3" className="fill-primary" />
      <rect x="30" y="34" width="40" height="3" rx="1.5" className="fill-primary-foreground" opacity=".6" />
    </svg>
  );
}

/** Calendar with a flag — for deadlines/plan empty states. */
export function CalendarMark({ className = '' }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 100 100" className={className} fill="none">
      <rect x="18" y="24" width="64" height="56" rx="10" className="fill-card" stroke="currentColor" strokeWidth="3" />
      <rect x="18" y="24" width="64" height="18" rx="8" className="fill-primary" />
      <circle cx="34" cy="18" r="4" className="fill-honey" />
      <circle cx="66" cy="18" r="4" className="fill-honey" />
      <rect x="30" y="52" width="12" height="12" rx="3" className="fill-honey" />
      <rect x="48" y="52" width="12" height="12" rx="3" className="fill-forest-200 dark:fill-forest-800" />
      <rect x="66" y="52" width="12" height="12" rx="3" className="fill-forest-200 dark:fill-forest-800" />
    </svg>
  );
}

/** Envelope with a checkmark — for the essay/letter review feature. */
export function Letter({ className = '' }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 100 100" className={className} fill="none">
      <rect x="14" y="28" width="72" height="50" rx="10" className="fill-card" stroke="currentColor" strokeWidth="3" />
      <path d="M18 32l32 24 32-24" className="stroke-primary" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="76" cy="24" r="14" className="fill-honey" />
      <path d="M70 24l4 4 8-8" className="stroke-[#3A2400]" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Signpost({ className = '' }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 100 84" className={className} fill="none">
      <ellipse cx="52" cy="79" rx="38" ry="4.5" className="fill-honey/30" />
      <rect x="48" y="14" width="5" height="65" rx="2.5" className="fill-forest-800 dark:fill-forest-300" />
      <path d="M53 18h30l8 8-8 8H53z" className="fill-primary" />
      <path d="M59 26h16" className="stroke-primary-foreground" strokeWidth="2" strokeLinecap="round" opacity=".8" />
      <path d="M48 40H19l-8 8 8 8h29z" className="fill-honey" />
      <path d="M22 48h16" className="stroke-[#3A2400]" strokeWidth="2" strokeLinecap="round" opacity=".55" />
      <path d="M30 79c1-5 3-7 5-8M34 79c0-4 1-6 3-7M68 79c1-4 3-6 5-7M72 79c0-3 1-5 2-6" className="stroke-forest-600 dark:stroke-forest-400" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
