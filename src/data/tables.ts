// Standard public scales. All flagged "needs review" in the UI until checked against official sources.
/** Beaufort scale: force, wind speed range in km/h [min, max|null]. Names: i18n `beaufort.N`. */
export const BEAUFORT: Array<[number, number | null]> = [
  [0, 0], [1, 5], [6, 11], [12, 19], [20, 28], [29, 38], [39, 49], [50, 61], [62, 74], [75, 88], [89, 102], [103, 117], [118, null],
];
/** Saffir-Simpson hurricane categories: sustained wind km/h [min, max|null]. */
export const SAFFIR: Array<[number, number | null]> = [[119, 153], [154, 177], [178, 208], [209, 251], [252, null]];
/** UV index exposure categories (WHO): [min, max|null], key `uv.cat.<k>`. */
export const UV: Array<[string, number, number | null]> = [['low', 0, 2], ['moderate', 3, 5], ['high', 6, 7], ['veryhigh', 8, 10], ['extreme', 11, null]];
/** Earthquake magnitude classes (USGS style). key `quake.cat.<k>`. */
export const QUAKE: Array<[string, number, number | null]> = [['minor', 3, 3.9], ['light', 4, 4.9], ['moderate', 5, 5.9], ['strong', 6, 6.9], ['major', 7, 7.9], ['great', 8, null]];

export function toRoman(n: number): string {
  if (!Number.isInteger(n) || n < 1 || n > 3999) return '';
  const m: Array<[number, string]> = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
  let out = '';
  for (const [v, s] of m) while (n >= v) { out += s; n -= v; }
  return out;
}
