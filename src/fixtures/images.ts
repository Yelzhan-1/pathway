// Campus photos used by Tropa (Wikimedia Commons, CC BY-SA — visible credit REQUIRED, see /credits and public/images/CREDITS.md).
// Pexels portraits from B2.1 are intentionally NOT shipped: stock models must never appear as real users.
import type { Img } from '@/types/pathway';
export const campus = {
  kaist: { src: '/images/campus/kaist-720.webp', width: 720, height: 450, alt: 'Кампус KAIST, фонтаны, Тэджон', credit: 'AhmadElq · Wikimedia Commons · CC BY-SA 4.0', blurDataURL: 'data:image/webp;base64,UklGRlgAAABXRUJQVlA4IEwAAADQAQCdASoQAAoAA4BaJQBOgCHPP/EIQAD+th4U1zTJSls7CS1kVtHM5c0878NuN2iDhQZFUrouGlszltPzG1WpH35V4HWxlRrSkAAA' },
  tuDelft: { src: '/images/campus/tu-delft-720.webp', width: 720, height: 450, alt: 'Библиотека TU Delft', credit: 'Nol Aders · Wikimedia Commons · CC BY-SA 3.0', blurDataURL: 'data:image/webp;base64,UklGRlQAAABXRUJQVlA4IEgAAADQAQCdASoQAAoAA4BaJagAAuWxq6kQGAD+9+kzpxZn2HwiXnaFc1Xyib5kqPZl/CQ08mPva+AdrC9kqHsYwOT308w0LpQgFAA=' },
} satisfies Record<string, Img>;
