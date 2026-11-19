import { FACTS, GLOSSARY } from '../data/library';
import { pick } from './l10n';

/** Deterministic "fact of the day": the same for everyone on a given local date, works offline. */
export function dayIndex(d: Date, n: number): number {
  const days = Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000);
  return ((days % n) + n) % n;
}
export const factOfDay = (d = new Date()) => FACTS[dayIndex(d, FACTS.length)];

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
/** Glossary terms that appear in a text (whole words, case-insensitive), in order of first appearance. */
export function findTerms(text: string, locale: string) {
  const out: Array<{ at: number; entry: (typeof GLOSSARY)[number] }> = [];
  for (const g of GLOSSARY) {
    const term = pick(g.term, locale); if (term.length < 3) continue;
    const m = new RegExp(`(?<![\\p{L}\\p{N}])${esc(term)}(?![\\p{L}\\p{N}])`, 'iu').exec(text);
    if (m) out.push({ at: m.index, entry: g });
  }
  return out.sort((a, b) => a.at - b.at).map((x) => x.entry);
}

/** NWS heat index (Rothfusz regression), inputs °F and % RH. Only meaningful from about 80 °F and 40 % RH. */
export function heatIndexF(tF: number, rh: number): number {
  const simple = 0.5 * (tF + 61 + (tF - 68) * 1.2 + rh * 0.094);
  if ((simple + tF) / 2 < 80) return simple;
  let hi = -42.379 + 2.04901523 * tF + 10.14333127 * rh - 0.22475541 * tF * rh - 0.00683783 * tF * tF - 0.05481717 * rh * rh + 0.00122874 * tF * tF * rh + 0.00085282 * tF * rh * rh - 0.00000199 * tF * tF * rh * rh;
  if (rh < 13 && tF >= 80 && tF <= 112) hi -= ((13 - rh) / 4) * Math.sqrt((17 - Math.abs(tF - 95)) / 17);
  else if (rh > 85 && tF >= 80 && tF <= 87) hi += ((rh - 85) / 10) * ((87 - tF) / 5);
  return hi;
}
export const heatIndexC = (tC: number, rh: number) => ((heatIndexF(tC * 1.8 + 32, rh) - 32) / 1.8);
/** Wind chill (NWS / Environment Canada), °C and km/h. Defined for T ≤ 10 °C and wind ≥ 4.8 km/h; otherwise returns the air temperature. */
export function windChillC(tC: number, kmh: number): number {
  if (tC > 10 || kmh < 4.8) return tC;
  const v = Math.pow(kmh, 0.16);
  return 13.12 + 0.6215 * tC - 11.37 * v + 0.3965 * tC * v;
}
export type HeatBand = 'caution' | 'extcaution' | 'danger' | 'extdanger' | 'none';
/** NWS heat index bands in °F. */
export const heatBand = (hiF: number): HeatBand => (hiF >= 125 ? 'extdanger' : hiF >= 103 ? 'danger' : hiF >= 91 ? 'extcaution' : hiF >= 80 ? 'caution' : 'none');

/** Modified Mercalli intensity (I–XII). Descriptions: i18n `mercalli.N`. */
export const MERCALLI = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
/** Beach flags (widespread colour code; local rules may differ). i18n: `beach.<id>`. */
export const BEACH_FLAGS: Array<[string, string]> = [['green', '#2e9e4f'], ['yellow', '#e6c200'], ['red', '#d12b2b'], ['doublered', '#8f1010'], ['purple', '#7a3fb0'], ['black', '#111111']];

/** Search by situation / material / symptom over guide fields (tags, materials, title, summary). */
export type FindKind = 'situation' | 'material' | 'symptom';
export function findGuides<T extends { title: string; summary: string; tags: string[]; materials: string[]; category: string }>(guides: T[], q: string, kind: FindKind): T[] {
  const n = q.trim().toLowerCase(); if (!n) return [];
  const has = (xs: string[]) => xs.some((x) => x.toLowerCase().includes(n));
  return guides.filter((g) => kind === 'material' ? has(g.materials) : kind === 'symptom' ? has(g.tags) || g.title.toLowerCase().includes(n) || g.summary.toLowerCase().includes(n) : has(g.tags) || g.category.toLowerCase().includes(n) || g.title.toLowerCase().includes(n));
}
