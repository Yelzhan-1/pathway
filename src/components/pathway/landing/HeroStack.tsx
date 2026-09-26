import { Flag } from "@/components/pathway/ui/Flag";
import { UniMonogram } from "@/components/pathway/ui/UniMonogram";
import { strings } from "@/lib/strings";
import { cn } from "@/lib/utils";

const TONE = {
  dream: "bg-tone-dream-bg text-tone-dream-fg",
  target: "bg-tone-honey-bg text-tone-honey-fg",
  safety: "bg-tone-mint-bg text-tone-mint-fg",
} as const;

const CARDS = [
  {
    id: "mit",
    name: "MIT",
    city: "Кембридж",
    flag: "US",
    monogram: "MIT",
    category: "dream",
    place: "left-0 top-2 z-30 w-[214px] -rotate-6",
    delay: "0ms",
  },
  {
    id: "kaist",
    name: "KAIST",
    city: "Тэджон",
    flag: "KR",
    monogram: "KAIST",
    category: "target",
    place: "right-1 top-[148px] z-20 w-[214px] rotate-[5deg]",
    delay: "140ms",
  },
  {
    id: "nu",
    name: "Nazarbayev University",
    city: "Астана",
    flag: "KZ",
    monogram: "NU",
    category: "safety",
    place: "bottom-1 left-8 z-10 w-[248px] -rotate-2",
    delay: "260ms",
  },
] as const;

/** Decorative product preview: three tilted catalog cards on a dashed path. */
export function HeroStack() {
  return (
    <div className="relative mx-auto h-[460px] w-full max-w-[520px]" aria-hidden>
      <div className="pointer-events-none absolute -right-4 top-10 size-56 rounded-full bg-tone-mint-bg/80 blur-2xl" />
      <div className="pointer-events-none absolute bottom-6 left-0 size-40 rounded-full bg-tone-dream-bg/70 blur-2xl" />
      <svg viewBox="0 0 520 460" className="absolute inset-0 h-full w-full text-primary/55" fill="none">
        <path
          className="anim-hero-dash"
          d="M118 118C190 156 268 150 348 198C412 236 300 292 176 352"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      </svg>
      {CARDS.map((card) => (
        <div key={card.id} className={cn("anim-hero-rise absolute", card.place)} style={{ animationDelay: card.delay }}>
          <article className="rounded-[20px] bg-card p-3 shadow-lift ring-1 ring-border">
            <div className="flex items-start justify-between gap-2">
              <UniMonogram id={card.id} text={card.monogram} size={40} className="ring-2 ring-card" />
              <span className={cn("inline-flex h-7 items-center rounded-full px-2.5 text-[12px] font-extrabold", TONE[card.category])}>
                {strings.fit.category[card.category]}
              </span>
            </div>
            <p className="mt-2.5 text-[15px] font-bold leading-tight">{card.name}</p>
            <p className="mt-1 flex items-center gap-1.5 text-[12px] font-semibold text-muted-foreground">
              <Flag code={card.flag} />
              {card.city}
            </p>
          </article>
        </div>
      ))}
    </div>
  );
}
