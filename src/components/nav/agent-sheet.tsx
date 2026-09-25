"use client";

import { Bot } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { strings } from "@/lib/strings";

export function AgentSheet() {
  return (
    <Sheet>
      <SheetTrigger render={<Button variant="outline" size="sm" />}>
        <Bot />
        {strings.nav.agent}
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{strings.placeholders.agentPanel.title}</SheetTitle>
          <SheetDescription>
            {strings.placeholders.agentPanel.description}
          </SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
}
