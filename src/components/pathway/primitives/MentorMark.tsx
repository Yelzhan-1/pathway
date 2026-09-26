/** Identity of the AI mentor: a calm leaf mark (no sparkles/robots). */
export function MentorMark({ size = 36 }: { size?: number }) {
  return (
    <span aria-hidden className="grid shrink-0 place-items-center rounded-full bg-forest-800 text-forest-200 dark:bg-forest-900" style={{ width: size, height: size }}>
      <svg viewBox="0 0 24 24" style={{ width: size * 0.5, height: size * 0.5 }} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 19c0-8 5-13 14-14-1 9-6 14-14 14z" /><path d="M5 19 13 11" />
      </svg>
    </span>
  );
}
