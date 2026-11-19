// PLACEHOLDER parameters (flagged "needs review" in the UI). Replace with reviewed values before release.
export const WATER_REVIEW = true;
export const WATER = { baseLPerPersonDay: 3, kidFactor: 0.5, hotFactor: 1.5, effortFactor: 1.25, petLPerDay: 1 };
export interface WaterNeed { people: number; kids: number; pets: number; days: number; hot: boolean; hardWork: boolean }
/** Litres of drinking+basic water for a group. `people` includes kids. */
export function waterNeed(n: WaterNeed): number {
  const adults = Math.max(0, n.people - n.kids);
  const f = (n.hot ? WATER.hotFactor : 1) * (n.hardWork ? WATER.effortFactor : 1);
  const perDay = (adults + n.kids * WATER.kidFactor) * WATER.baseLPerPersonDay * f + n.pets * WATER.petLPerDay;
  return Math.ceil(perDay * n.days * 10) / 10;
}

/** Product to add. concentration is % active chlorine of the product (read the label); target in mg/L. 1 mL ≈ 20 drops (assumption). */
export const CHLORINE_DEFAULT_TARGET_MGL = 5;
export const CHLORINE_WAIT_MIN = 30; // spec §5.3: always wait 30 minutes
export function chlorineDose(volumeL: number, concentrationPct: number, targetMgL = CHLORINE_DEFAULT_TARGET_MGL) {
  if (!(volumeL > 0) || !(concentrationPct > 0) || !(targetMgL > 0)) return null;
  const mL = (targetMgL * volumeL) / (concentrationPct * 10); // % × 10 000 = mg/L, ÷ 1000 mg per mL-equivalent
  return { mL, drops: Math.max(1, Math.round(mL * 20)), waitMin: CHLORINE_WAIT_MIN };
}
