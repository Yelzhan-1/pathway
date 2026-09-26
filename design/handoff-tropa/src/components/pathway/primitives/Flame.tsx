'use client';
import { useId } from 'react';
/** Streak flame — honey gradient (decorative only), CSS flicker on transform. */
export function Flame({ size = 28 }: { size?: number }) {
  const id = 'fl' + useId().replace(/:/g, '');
  return (
    <span aria-hidden className="relative inline-block" style={{ width: size, height: size }}>
      <svg viewBox="0 0 24 24" className="anim-flame absolute inset-0 size-full">
        <defs><linearGradient id={id} x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#E0851B" /><stop offset=".6" stopColor="#F8AC3D" /><stop offset="1" stopColor="#FFD08A" /></linearGradient></defs>
        <path d="M12 1.8c1.2 4.1 5.6 6.3 5.6 11.7A5.6 5.6 0 0 1 6.4 13.5c0-2.3 1.1-3.9 2.3-5 .1 2.2 1.1 3.3 2.2 3.4.2-3.4-.9-6.6 1.1-10.1z" fill={`url(#${id})`} />
      </svg>
      <svg viewBox="0 0 24 24" className="anim-flame-core absolute inset-0 size-full">
        <path d="M12 11.2c.7 2 2.8 2.9 2.8 5.1a2.8 2.8 0 0 1-5.6 0c0-1.4.8-2.2 1.4-2.8.2 1.1.6 1.5 1.3 1.6 0-1.3-.3-2.6.1-3.9z" fill="#FFF4DF" />
      </svg>
    </span>
  );
}
