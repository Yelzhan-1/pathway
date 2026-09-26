import type { AiBuddy } from '@/types/pathway';
import { MentorMark } from '../primitives/MentorMark';
import { Button, TCard, WidgetSkeleton } from '../ui/tropa';

/**
 * AI buddy (block 5 · LATER). The «ИИ, не человек» label is REQUIRED in every state — the assistant never pretends to be a person.
 * null → intro message + profile CTA (no fake advice).
 */
export function AiBuddyCard({ data, loading }: { data: AiBuddy | null; loading?: boolean }) {
  if (loading) return <WidgetSkeleton rows={2} />;
  const msg = data?.message ?? 'Привет! Я AI-помощник Pathway. Скоро смогу подсказывать по твоему плану и дедлайнам. А пока начнём с профиля?';
  return (
    <TCard labelledBy="ai-h">
      <h2 id="ai-h" className="sr-only">AI-помощник</h2>
      <div className="flex items-start gap-3">
        <MentorMark size={44} />
        <p className="relative rounded-[18px] rounded-tl-[4px] bg-secondary px-3.5 py-2.5 text-[14px] font-semibold leading-snug">{msg}</p>
      </div>
      <div className="mt-3 flex gap-2">
        {data ? (
          <>
            <Button href={data.primary.href} size="sm" className="flex-1">{data.primary.label}</Button>
            {data.secondary && <Button href={data.secondary.href} size="sm" variant="soft" className="flex-1">{data.secondary.label}</Button>}
          </>
        ) : <Button href="/profile" size="sm" className="flex-1">Заполнить профиль</Button>}
      </div>
      <p className="mt-2 text-[11.5px] font-semibold text-muted-foreground">AI-помощник · ИИ, не человек</p>
    </TCard>
  );
}
