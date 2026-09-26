// EXAMPLE — merge into your existing src/app/layout.tsx (don't overwrite it).
import type { Metadata, Viewport } from 'next';
import { onest, unbounded, caveat } from './fonts';
import { PathwayProviders } from '@/components/pathway/PathwayProviders';
import './globals.css';

export const metadata: Metadata = { title: 'Pathway — твоя тропа к поступлению' };
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F3FDF8' },
    { media: '(prefers-color-scheme: dark)', color: '#05110C' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: PathwayProviders toggles `lite`, the theme toggle / next-themes toggles `dark` on <html>.
    <html lang="ru" className={`${onest.variable} ${unbounded.variable} ${caveat.variable}`} suppressHydrationWarning>
      <body>
        <PathwayProviders>{children}</PathwayProviders>
      </body>
    </html>
  );
}
