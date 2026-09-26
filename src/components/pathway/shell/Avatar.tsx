import { initials } from '@/lib/format';
import { cn } from '@/lib/utils';

/** Small round initials avatar. Shared by the shell, profile page, and the account menu. */
export function Avatar({ name, size = 40, className }: { name: string; size?: number; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn('grid shrink-0 place-items-center rounded-full bg-tone-mint-bg font-extrabold text-tone-mint-fg ring-2 ring-card', className)}
      style={{ width: size, height: size, fontSize: size * 0.35 }}
    >
      {initials(name)}
    </span>
  );
}
