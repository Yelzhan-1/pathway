"use client";

import { useEffect } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { strings } from "@/lib/strings";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">
        {strings.errorPage.title}
      </h1>
      <p className="max-w-md text-muted-foreground">
        {strings.errorPage.description}
      </p>
      <div className="flex gap-3">
        <Button onClick={reset}>{strings.errorPage.retry}</Button>
        <Button variant="outline" render={<Link href="/" />}>
          {strings.errorPage.backHome}
        </Button>
      </div>
    </div>
  );
}
