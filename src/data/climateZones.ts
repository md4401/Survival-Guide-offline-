// 12 broad climate zones (Köppen-style groupings). Descriptions are QUALITATIVE (no numbers) and need review. Text: i18n keys zone.<id>, zone.<id>.d, zone.<id>.e
export const ZONES = ['equatorial', 'monsoon', 'savanna', 'desert', 'steppe', 'subtropical', 'mediterranean', 'oceanic', 'continental', 'subarctic', 'tundra', 'icecap'] as const;
export type Zone = (typeof ZONES)[number];

/** Latitude bands used by the map: an APPROXIMATION by latitude only, not the real climate zone. */
export const BANDS = ['tropical', 'subtropical', 'temperate', 'subpolar', 'polar'] as const;
export type Band = (typeof BANDS)[number];
export const TROPIC = 23.44, POLAR_CIRCLE = 66.56;
export function bandFor(lat: number): Band {
  const a = Math.abs(lat);
  return a < TROPIC ? 'tropical' : a < 35 ? 'subtropical' : a < 55 ? 'temperate' : a < POLAR_CIRCLE ? 'subpolar' : 'polar';
}
export const BAND_COLOR: Record<Band, string> = { tropical: '#ff7a59', subtropical: '#ffc145', temperate: '#3ddc97', subpolar: '#5cb8ff', polar: '#c9a7ff' };
