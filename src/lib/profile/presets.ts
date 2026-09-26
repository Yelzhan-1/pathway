/** If `raw` matches a preset ignoring case and surrounding space, return that preset. */
export function canonicalizePreset(
  raw: string,
  presets: readonly string[],
): string {
  const trimmed = raw.trim();
  const folded = trimmed.toLocaleLowerCase("ru");
  return (
    presets.find((item) => item.toLocaleLowerCase("ru") === folded) ?? trimmed
  );
}

export function resolveOtherValue(
  raw: string,
  presets: readonly string[],
  isOther: boolean,
): { value: string; isOther: boolean } {
  const value = canonicalizePreset(raw, presets);
  if (!isOther) return { value, isOther: false };
  const matchedPreset = presets.some((item) => item === value);
  return { value, isOther: !matchedPreset };
}
