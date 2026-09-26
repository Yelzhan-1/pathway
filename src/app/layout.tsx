import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "next-themes";

import { PathwayProviders } from "@/components/pathway/PathwayProviders";
import { Toaster } from "@/components/ui/sonner";
import { strings } from "@/lib/strings";

import { caveat, onest, unbounded } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: strings.app.name,
  description: strings.landing.tagline,
};

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F3FDF8" },
    { media: "(prefers-color-scheme: dark)", color: "#05110C" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ru"
      className={`${onest.variable} ${unbounded.variable} ${caveat.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <PathwayProviders>
            {children}
            <Toaster />
          </PathwayProviders>
        </ThemeProvider>
      </body>
    </html>
  );
}
