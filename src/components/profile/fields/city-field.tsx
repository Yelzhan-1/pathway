"use client";

import { useState } from "react";

import { OptionCard } from "@/components/onboarding/option-card";
import { FieldError } from "@/components/ui/field";
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
  submitted = false,
  isOther: isOtherProp,
  onIsOtherChange,
}: {
  value: string;
  onChange: (city: string) => void;
  submitted?: boolean;
  isOther?: boolean;
  onIsOtherChange?: (next: boolean) => void;
}) {
  const [uncontrolled, setUncontrolled] = useState(
    () => value.trim().length > 0 && !isPresetCity(value),
  );
  const isOther = isOtherProp ?? uncontrolled;

  function setOther(next: boolean) {
    if (isOtherProp === undefined) setUncontrolled(next);
    onIsOtherChange?.(next);
  }

  const selected = isOther ? OTHER_CITY_VALUE : value;

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
            onSelect={() => {
              setOther(false);
              onChange(city);
            }}
            title={city}
          />
        ))}
        <OptionCard
          selected={isOther}
          onSelect={() => {
            const switchingOn = !isOther;
            setOther(true);
            if (switchingOn && isPresetCity(value)) onChange("");
          }}
          title={strings.common.other}
        />
      </div>
      {isOther ? (
        <div className="flex flex-col gap-2">
          <Label htmlFor="city-other">{strings.onboarding.steps.city.otherLabel}</Label>
          <Input
            id="city-other"
            className="h-11 min-h-11"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={strings.onboarding.steps.city.otherPlaceholder}
            autoComplete="address-level2"
            aria-invalid={submitted && value.trim().length === 0}
          />
          {submitted && isOther && value.trim().length === 0 ? (
            <FieldError>{strings.profile.errors.cityOtherRequired}</FieldError>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
