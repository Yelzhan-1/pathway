// next/font — self-hosted at build time, no layout shift, no runtime request to Google.
// All three are variable fonts on Google Fonts → no `weight` needed.
//   Onest     100–900  body + UI           subsets: cyrillic, cyrillic-ext (Kazakh Ә Ғ Қ Ң Ө Ұ Ү Һ І), latin, latin-ext
//   Unbounded 200–900  display headings    subsets: cyrillic, cyrillic-ext, latin, latin-ext  (verified: Russian + Kazakh glyphs present)
//   Caveat    400–700  hand notes only     subsets: cyrillic, cyrillic-ext, latin — NO ₸ and NO → glyphs
import { Onest, Unbounded, Caveat } from 'next/font/google';

export const onest = Onest({
  subsets: ['cyrillic', 'cyrillic-ext', 'latin', 'latin-ext'],
  variable: '--font-onest',
  display: 'swap',
});

// Headings (H1–H3), big numbers, logo. Never for body copy, inputs, buttons or small labels (<14px).
export const unbounded = Unbounded({
  subsets: ['cyrillic', 'cyrillic-ext', 'latin', 'latin-ext'],
  variable: '--font-unbounded',
  display: 'swap',
});

export const caveat = Caveat({
  subsets: ['cyrillic', 'cyrillic-ext', 'latin'],
  variable: '--font-caveat',
  display: 'swap',
  preload: false, // accents are below the LCP
});
