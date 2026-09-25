"use client";

import { Button } from "@/components/ui/button";
import type { CvHeadingsLang } from "@/lib/profile/types";
import { strings } from "@/lib/strings";

export function HeadingLangToggle({
  value,
  onChange,
}: {
  value: CvHeadingsLang;
  onChange: (lang: CvHeadingsLang) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={strings.cv.headingsLang}
      className="flex gap-2"
    >
      {(["ru", "en"] as const).map((lang) => (
        <Button
          key={lang}
          type="button"
          size="sm"
          variant={value === lang ? "default" : "outline"}
          aria-checked={value === lang}
          role="radio"
          className="min-h-11"
          onClick={() => onChange(lang)}
        >
          {lang === "ru" ? strings.cv.headingsRu : strings.cv.headingsEn}
        </Button>
      ))}
    </div>
  );
}
