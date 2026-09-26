import { majorMatches } from "@/lib/matching/synonyms";
import type { Option } from "@/types/pathway";

export function filterCheckUniversities(
  universities: Option[],
  selected: { program: string; country: string },
): Option[] {
  return universities.filter((row) => {
    if (selected.country && row.countryKey && row.countryKey !== selected.country) return false;
    if (
      selected.program &&
      row.majors &&
      row.majors.length > 0 &&
      !majorMatches(selected.program, row.majors)
    ) {
      return false;
    }
    return true;
  });
}
