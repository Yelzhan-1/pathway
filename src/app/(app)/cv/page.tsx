import type { Metadata } from "next";
import { PenLine } from "lucide-react";

import { CvBuilder } from "@/components/cv/cv-builder";
import { Button, IconTile, TCard } from "@/components/pathway/ui/tropa";
import { getCurrentProfile } from "@/lib/profile/queries";
import { strings } from "@/lib/strings";

export const metadata: Metadata = {
  title: `${strings.cv.title} — ${strings.app.name}`,
};

export default async function CvPage() {
  const { user, profile, updatedAt } = await getCurrentProfile();

  return (
    <div className="flex flex-col gap-4">
      <TCard as="div" className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <IconTile icon={PenLine} tone="sky" size={40} />
          <div>
            <p className="text-[14.5px] font-bold leading-snug">{strings.essay.docCard.title}</p>
            <p className="text-[13px] font-medium text-muted-foreground">{strings.essay.docCard.text}</p>
          </div>
        </div>
        <Button href="/essay" variant="soft" size="sm" icon className="self-start sm:self-auto">
          {strings.essay.docCard.cta}
        </Button>
      </TCard>
      <CvBuilder
        profile={profile}
        email={user.email ?? ""}
        userId={user.id}
        updatedAt={updatedAt}
      />
    </div>
  );
}
