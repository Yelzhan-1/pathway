'use client';
import { useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * «Подробнее» disclosure: one line of copy always visible, the rest (long
 * notes/explanations) collapses behind a small toggle. Used across the
 * redesigned inner pages to cut visible text without losing information.
 */
export function Collapsible({
  label = 'Подробнее',
  closeLabel = 'Свернуть',
  defaultOpen = false,
  children,
  className,
}: {
  label?: string;
  closeLabel?: string;
  defaultOpen?: boolean;
  children: ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="inline-flex min-h-9 items-center gap-1.5 text-[13.5px] font-bold text-primary"
      >
        {open ? closeLabel : label}
        <ChevronDown className={cn('size-4 transition-transform', open && 'rotate-180')} aria-hidden />
      </button>
      {open && <div className="mt-2 text-[13.5px] font-medium leading-snug text-ink-2">{children}</div>}
    </div>
  );
}
