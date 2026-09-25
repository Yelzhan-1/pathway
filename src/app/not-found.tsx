import Link from "next/link";
import type { Metadata } from "next";

import { Button } from "@/components/ui/button";
import { strings } from "@/lib/strings";

export const metadata: Metadata = {
  title: `${strings.notFoundPage.title} — ${strings.app.name}`,
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">
        {strings.notFoundPage.title}
      </h1>
      <p className="max-w-md text-muted-foreground">
        {strings.notFoundPage.description}
      </p>
      <Button nativeButton={false} render={<Link href="/" />}>
        {strings.notFoundPage.backHome}
      </Button>
    </div>
  );
}
