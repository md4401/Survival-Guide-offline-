// Geohash (base32) encode/decode and the coarse "channel levels" used by local channels.
const B32 = '0123456789bcdefghjkmnpqrstuvwxyz';
export function encode(lat: number, lon: number, precision = 6): string {
  let latR = [-90, 90], lonR = [-180, 180], bit = 0, ch = 0, even = true, out = '';
  while (out.length < precision) {
    const r = even ? lonR : latR; const v = even ? lon : lat; const mid = (r[0] + r[1]) / 2;
    if (v >= mid) { ch = (ch << 1) | 1; r[0] = mid; } else { ch <<= 1; r[1] = mid; }
    even = !even;
    if (++bit === 5) { out += B32[ch]; bit = 0; ch = 0; }
  }
  return out;
}
export function decode(hash: string): { lat: number; lon: number; latErr: number; lonErr: number } {
  let latR = [-90, 90], lonR = [-180, 180], even = true;
  for (const c of hash.toLowerCase()) {
    const v = B32.indexOf(c); if (v < 0) throw new Error('geohash');
    for (let b = 4; b >= 0; b--) { const r = even ? lonR : latR; const mid = (r[0] + r[1]) / 2; if ((v >> b) & 1) r[0] = mid; else r[1] = mid; even = !even; }
  }
  return { lat: (latR[0] + latR[1]) / 2, lon: (lonR[0] + lonR[1]) / 2, latErr: (latR[1] - latR[0]) / 2, lonErr: (lonR[1] - lonR[0]) / 2 };
}
export const isGeohash = (s: string) => /^[0-9bcdefghjkmnpqrstuvwxyz]{1,12}$/.test(s);
/** Channel levels shown in the UI: precision → name and rough size. */
export const LEVELS = [
  { id: 'block', precision: 7, km: 0.2 }, { id: 'neighborhood', precision: 6, km: 1.2 }, { id: 'city', precision: 5, km: 4.9 }, { id: 'province', precision: 4, km: 39 }, { id: 'region', precision: 2, km: 1250 },
] as const;
export const channelsFor = (lat: number, lon: number) => LEVELS.map((l) => ({ ...l, hash: encode(lat, lon, l.precision) }));
