import type { Metadata } from "next";

import { CvBuilder } from "@/components/cv/cv-builder";
import { getCurrentProfile } from "@/lib/profile/queries";
import { strings } from "@/lib/strings";

export const metadata: Metadata = {
  title: `${strings.cv.title} — ${strings.app.name}`,
};

export default async function CvPage() {
  const { user, profile } = await getCurrentProfile();

  return (
    <CvBuilder profile={profile} email={user.email ?? ""} />
  );
}
