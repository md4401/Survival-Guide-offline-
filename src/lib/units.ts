export type Category = 'temperature' | 'length' | 'mass' | 'volume' | 'speed' | 'pressure' | 'area' | 'time' | 'data';
/** factor = how many base units in one of this unit (base: m, kg, L, m/s, hPa, m², s, B). Temperature is handled separately. */
export const UNITS: Record<Category, Record<string, number>> = {
  temperature: { C: 1, F: 1, K: 1 },
  length: { m: 1, km: 1000, cm: 0.01, mi: 1609.344, ft: 0.3048, in: 0.0254, yd: 0.9144 },
  mass: { kg: 1, g: 0.001, lb: 0.45359237, oz: 0.028349523125 },
  volume: { L: 1, mL: 0.001, gal: 3.785411784, qt: 0.946352946, 'fl oz': 0.0295735295625 },
  speed: { 'km/h': 1 / 3.6, 'm/s': 1, mph: 0.44704, kn: 0.514444 },
  pressure: { hPa: 1, kPa: 10, inHg: 33.8638866667, mmHg: 1.33322387415 },
  area: { 'm²': 1, 'km²': 1e6, ha: 1e4, 'ft²': 0.09290304, ac: 4046.8564224 },
  time: { s: 1, min: 60, h: 3600, day: 86400, week: 604800 },
  data: { B: 1, KB: 1e3, MB: 1e6, GB: 1e9, TB: 1e12, KiB: 1024, MiB: 1048576, GiB: 1073741824 },
};
const toC = (v: number, u: string) => (u === 'F' ? ((v - 32) * 5) / 9 : u === 'K' ? v - 273.15 : v);
const fromC = (c: number, u: string) => (u === 'F' ? (c * 9) / 5 + 32 : u === 'K' ? c + 273.15 : c);
export function convert(cat: Category, from: string, to: string, v: number): number {
  if (cat === 'temperature') return fromC(toC(v, from), to);
  return (v * UNITS[cat][from]) / UNITS[cat][to];
}
