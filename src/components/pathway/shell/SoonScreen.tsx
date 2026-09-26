import { Display, TCard } from "@/components/pathway/ui/tropa";
import { strings } from "@/lib/strings";

export function SoonScreen({ title, detail }: { title: string; detail?: string }) {
  return (
    <TCard className="mx-auto mt-6 max-w-lg">
      <Display as="h1" className="text-[28px] font-bold">
        {title}
      </Display>
      <p className="mt-3 text-[16px] font-semibold text-ink-2">{strings.soon.title}</p>
      <p className="mt-2 text-[15px] font-medium text-muted-foreground">{detail ?? strings.soon.body}</p>
    </TCard>
  );
}
