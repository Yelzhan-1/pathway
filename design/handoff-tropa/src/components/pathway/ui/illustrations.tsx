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
