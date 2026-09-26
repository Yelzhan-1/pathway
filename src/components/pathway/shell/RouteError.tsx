"use client";

import { useEffect } from "react";

import { Button, Display, TCard } from "@/components/pathway/ui/tropa";
import { strings } from "@/lib/strings";

export function RouteError({
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
    <TCard className="mx-auto mt-6 max-w-lg" labelledBy="route-error-h">
      <Display as="h1" id="route-error-h" className="text-[28px] font-bold">
        {strings.errorPage.title}
      </Display>
      <p className="mt-3 text-[15px] font-medium text-muted-foreground">{strings.errorPage.description}</p>
      <Button type="button" className="mt-4" onClick={reset}>
        {strings.errorPage.retry}
      </Button>
    </TCard>
  );
}
