import { describe, expect, it } from "vitest";

import { filterCheckUniversities } from "@/lib/dashboard/check-filter";
import type { Option } from "@/types/pathway";

const rows: Option[] = [
  {
    value: "cambridge",
    label: "Cambridge",
    countryKey: "UK",
    majors: ["Computer Science", "Economics"],
  },
  {
    value: "nu",
    label: "Nazarbayev University",
    countryKey: "Kazakhstan",
    majors: ["Computer Science"],
  },
  {
    value: "kimep",
    label: "KIMEP",
    countryKey: "Kazakhstan",
    majors: ["Business Administration"],
  },
];

describe("filterCheckUniversities", () => {
  it("keeps universities that match the chosen program and country", () => {
    expect(
      filterCheckUniversities(rows, { program: "Компьютерные науки", country: "Kazakhstan" }).map(
        (row) => row.value,
      ),
    ).toEqual(["nu"]);
  });

  it("ignores empty filters", () => {
    expect(filterCheckUniversities(rows, { program: "", country: "" })).toHaveLength(3);
  });
});
