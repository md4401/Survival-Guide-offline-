// Köppen-Geiger decoding. Class codes come from the dataset; meanings follow the standard scheme (A tropical, B arid, C temperate, D continental, E polar).
export type Group = 'A' | 'B' | 'C' | 'D' | 'E';
export interface Decoded { code: string; group: Group; precip: string; temp: string | null; keys: string[] }
export const GROUP_COLOR: Record<Group, string> = { A: '#ff5a5f', B: '#ffc145', C: '#3ddc97', D: '#5cb8ff', E: '#c9a7ff' };

/** "Cfb" → group C, precipitation f, temperature b, with the i18n keys that describe it. null for unknown codes. */
export function decode(code: string): Decoded | null {
  const m = /^([ABCDE])([fmwsWSTF])([abcdhk])?$/.exec(code);
  if (!m) return null;
  const [, g, p, t] = m as unknown as [string, Group, string, string | undefined];
  const ok = (g === 'A' && 'fmws'.includes(p) && !t) || (g === 'B' && 'WS'.includes(p) && !!t && 'hk'.includes(t)) ||
    ((g === 'C' || g === 'D') && 'swf'.includes(p) && !!t && (g === 'D' ? 'abcd' : 'abc').includes(t)) || (g === 'E' && 'TF'.includes(p) && !t);
  if (!ok) return null;
  const keys = [`kg.${g}`, `kp.${g}.${p}`, ...(t ? [`kt.${g === 'B' ? 'B' : g}.${t}`] : [])];
  return { code, group: g, precip: p, temp: t ?? null, keys };
}
export const groupOf = (code: string): Group | null => decode(code)?.group ?? null;
/** All classes in the dataset (30). */
export const ALL_CLASSES = ['Af', 'Am', 'Aw', 'BWh', 'BWk', 'BSh', 'BSk', 'Csa', 'Csb', 'Csc', 'Cwa', 'Cwb', 'Cwc', 'Cfa', 'Cfb', 'Cfc', 'Dsa', 'Dsb', 'Dsc', 'Dsd', 'Dwa', 'Dwb', 'Dwc', 'Dwd', 'Dfa', 'Dfb', 'Dfc', 'Dfd', 'ET', 'EF'] as const;
