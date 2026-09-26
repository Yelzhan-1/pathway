"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { FieldLabel } from "@/components/ui/field";
import { getCountryLabel } from "@/lib/profile/types";
import { strings } from "@/lib/strings";

export function CountriesField({
  countries,
  value,
  onChange,
}: {
  countries: string[];
  value: string[];
  onChange: (countries: string[]) => void;
}) {
  function toggle(country: string, checked: boolean) {
    if (checked) {
      onChange([...new Set([...value, country])]);
      return;
    }
    onChange(value.filter((item) => item !== country));
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">
        {strings.onboarding.steps.countries.hint}
      </p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {countries.map((country) => {
          const checked = value.includes(country);
          const id = `country-${country.replace(/[^a-zA-Z0-9]+/g, "-")}`;
          return (
            <FieldLabel
              key={country}
              htmlFor={id}
              className="min-h-11 cursor-pointer items-center rounded-xl border px-3 py-2 has-data-checked:border-primary has-data-checked:bg-accent"
            >
              <Checkbox
                id={id}
                checked={checked}
                onCheckedChange={(next) => toggle(country, next === true)}
              />
              <span>{getCountryLabel(country)}</span>
            </FieldLabel>
          );
        })}
      </div>
    </div>
  );
}
