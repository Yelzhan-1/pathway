/** Aid values that can cover a gap between tuition and the stated budget. */
export const GRANT_AID = ["need_blind", "need_aware", "merit"] as const;

export function isGrantAid(aid: string | null | undefined): boolean {
  return GRANT_AID.includes(aid as (typeof GRANT_AID)[number]);
}

export function isFreeOrGrantUniversity(university: {
  tuition_usd_per_year: number | null;
  aid_for_internationals: string | null;
}): boolean {
  if (university.tuition_usd_per_year === 0) return true;
  return isGrantAid(university.aid_for_internationals);
}
