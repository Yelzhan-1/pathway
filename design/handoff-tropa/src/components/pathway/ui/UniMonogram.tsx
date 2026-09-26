/**
 * University monogram tile — deliberately NOT the real logo (trademarks). Colour is picked by a stable hash of the id
 * from the Pathway palette, never from the university's brand colours.
 */
const TONES = [
  'bg-forest-800 text-forest-100 dark:bg-forest-700 dark:text-forest-50',
  'bg-dream-soft text-dream',
  'bg-honey-soft text-honey-deep',
  'bg-secondary text-secondary-foreground ring-1 ring-inset ring-forest-200 dark:ring-forest-800',
  'bg-foreground text-background',
];
const hash = (s: string) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
export function UniMonogram({ id, text, size = 44, className = '' }: { id: string; text: string; size?: number; className?: string }) {
  const n = text.length;
  const fs = n <= 2 ? size * 0.38 : n <= 3 ? size * 0.32 : n <= 4 ? size * 0.27 : size * 0.235;
  return (
    <span aria-hidden className={`grid shrink-0 place-items-center rounded-[12px] font-extrabold tracking-[-0.03em] ${TONES[hash(id) % TONES.length]} ${className}`} style={{ width: size, height: size, fontSize: fs }}>
      {text}
    </span>
  );
}
