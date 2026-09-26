'use client';
import Image from 'next/image';
import type { Img } from '@/types/pathway';
import { usePrefs } from '@/lib/prefs';

/**
 * Photo = next/image with blur placeholder + lazy loading.
 * `hideInLite`: on lite (Save-Data / 2g-3g / low memory) render only the inline blur placeholder — no photo download.
 * `eager`: above-the-fold image → loading=eager + fetchPriority=high (Next 16 deprecates `priority`; `preload` only if it is THE LCP on every viewport).
 * Credit is exposed as `title` (tooltip) — required for CC BY-SA images.
 */
export function Photo({ img, sizes, className = '', eager = false, hideInLite = false, rounded = '' }: { img: Img; sizes: string; className?: string; eager?: boolean; hideInLite?: boolean; rounded?: string }) {
  const { lite } = usePrefs();
  if (lite && hideInLite) {
    // 0 extra bytes: the inline 16px blur placeholder, softened with CSS blur (no network request).
    return (
      <div role="img" aria-label={img.alt} className={`relative overflow-hidden bg-forest-100 dark:bg-forest-900 ${rounded} ${className}`}>
        {img.blurDataURL && <div aria-hidden className="absolute inset-[-12%] bg-cover bg-center blur-xl" style={{ backgroundImage: `url(${img.blurDataURL})` }} />}
      </div>
    );
  }
  return (
    <div className={`relative overflow-hidden ${rounded} ${className}`} title={img.credit ? `Фото: ${img.credit}` : undefined}>
      <Image src={img.src} alt={img.alt} fill sizes={sizes} loading={eager ? 'eager' : 'lazy'} fetchPriority={eager ? 'high' : 'auto'} placeholder={img.blurDataURL ? 'blur' : 'empty'} blurDataURL={img.blurDataURL} className="object-cover" />
    </div>
  );
}
