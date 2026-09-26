"use client";

import { signOutAction } from "@/lib/actions/sign-out";
import { Button } from "@/components/ui/button";
import { clearBrowserCvDrafts } from "@/lib/hooks/autosave-patch";
import { strings } from "@/lib/strings";

export function SignOutButton({ userId }: { userId: string }) {
  return (
    <form
      action={signOutAction}
      onSubmit={() => clearBrowserCvDrafts(userId)}
    >
      <Button type="submit" variant="ghost" size="sm">
        {strings.nav.signOut}
      </Button>
    </form>
  );
}
