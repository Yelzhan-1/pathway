import { strings } from "@/lib/strings";

import { AgentSheet } from "./agent-sheet";
import { UserMenu } from "./user-menu";

export function TopBar({
  fullName,
  userId,
}: {
  fullName: string;
  userId: string;
}) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b bg-card px-4 md:px-8">
      <div className="text-base font-semibold tracking-tight md:hidden">
        {strings.app.name}
      </div>
      <div className="ml-auto flex items-center gap-3">
        <AgentSheet />
        <UserMenu fullName={fullName} userId={userId} />
      </div>
    </header>
  );
}
