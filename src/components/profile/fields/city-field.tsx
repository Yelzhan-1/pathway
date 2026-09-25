"use client";

import { OptionCard } from "@/components/onboarding/option-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KZ_CITIES, OTHER_CITY_VALUE } from "@/lib/profile/types";
import { strings } from "@/lib/strings";

function isPresetCity(city: string): boolean {
  return (KZ_CITIES as readonly string[]).includes(city);
}

export function CityField({
  value,
  onChange,
}: {
  value: string;
  onChange: (city: string) => void;
}) {
  const usingOther = value.length > 0 && !isPresetCity(value);
  const selected = usingOther ? OTHER_CITY_VALUE : value;

  return (
    <div className="flex flex-col gap-3">
      <div
        role="radiogroup"
        aria-label={strings.onboarding.steps.city.legend}
        className="grid grid-cols-1 gap-3 sm:grid-cols-2"
      >
        {KZ_CITIES.map((city) => (
          <OptionCard
            key={city}
            selected={selected === city}
            onSelect={() => onChange(city)}
            title={city}
          />
        ))}
        <OptionCard
          selected={selected === OTHER_CITY_VALUE}
          onSelect={() => onChange(usingOther ? value : "")}
          title={strings.common.other}
        />
      </div>
      {selected === OTHER_CITY_VALUE ? (
        <div className="flex flex-col gap-2">
          <Label htmlFor="city-other">{strings.onboarding.steps.city.otherLabel}</Label>
          <Input
            id="city-other"
            className="min-h-11"
            value={usingOther ? value : ""}
            onChange={(event) => onChange(event.target.value)}
            placeholder={strings.onboarding.steps.city.otherPlaceholder}
            autoComplete="address-level2"
          />
        </div>
      ) : null}
    </div>
  );
}
