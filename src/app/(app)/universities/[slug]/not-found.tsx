import { Button, Display, TCard } from "@/components/pathway/ui/tropa";
import { strings } from "@/lib/strings";

export default function UniversityNotFound() {
  return (
    <TCard className="mx-auto mt-6 max-w-lg" labelledBy="uni-404">
      <Display as="h1" id="uni-404" className="text-[28px] font-bold">
        {strings.notFoundPage.title}
      </Display>
      <p className="mt-3 text-[15px] font-medium text-muted-foreground">{strings.notFoundPage.description}</p>
      <Button href="/universities" className="mt-4">
        {strings.universities.title}
      </Button>
    </TCard>
  );
}
