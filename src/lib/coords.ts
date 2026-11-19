export interface Fix { lat: number; lon: number; accuracy?: number; time: number }

function dms(v: number, pos: string, neg: string): string {
  const h = v >= 0 ? pos : neg; const a = Math.abs(v);
  const d = Math.floor(a); const mf = (a - d) * 60; const m = Math.floor(mf); const s = (mf - m) * 60;
  return `${d}°${String(m).padStart(2, '0')}'${s.toFixed(1).padStart(4, '0')}"${h}`;
}
export const formatDecimal = (f: Fix) => `${f.lat.toFixed(5)}, ${f.lon.toFixed(5)}`;
export const formatDms = (f: Fix) => `${dms(f.lat, 'N', 'S')} ${dms(f.lon, 'E', 'W')}`;

/** Ready-to-send text for SMS/radio. Contains only what the user chose to share. */
export function shareText(f: Fix, label: { lat: string; lon: string; acc: string; time: string }): string {
  const t = new Date(f.time).toISOString().replace('T', ' ').slice(0, 16) + ' UTC';
  const acc = f.accuracy != null ? `\n${label.acc}: ${Math.round(f.accuracy)} m` : '';
  return `${label.lat}: ${f.lat.toFixed(5)}\n${label.lon}: ${f.lon.toFixed(5)}${acc}\n${label.time}: ${t}`;
}

// ---- UTM (WGS84, Krüger series; accurate to well under 1 m inside the zone) ----
const A = 6378137, F = 1 / 298.257223563, K0 = 0.9996;
const E2 = F * (2 - F), EP2 = E2 / (1 - E2);
export interface Utm { zone: number; band: string; easting: number; northing: number; south: boolean }
const BANDS = 'CDEFGHJKLMNPQRSTUVWX';
export const utmZone = (lon: number) => Math.min(60, Math.max(1, Math.floor((lon + 180) / 6) + 1));
const bandOf = (lat: number) => BANDS[Math.min(19, Math.max(0, Math.floor((lat + 80) / 8)))];
export function toUtm(lat: number, lon: number): Utm {
  const zone = utmZone(lon), lon0 = ((zone - 1) * 6 - 180 + 3) * (Math.PI / 180);
  const phi = (lat * Math.PI) / 180, lam = (lon * Math.PI) / 180;
  const N = A / Math.sqrt(1 - E2 * Math.sin(phi) ** 2), T = Math.tan(phi) ** 2, C = EP2 * Math.cos(phi) ** 2, Aa = Math.cos(phi) * (lam - lon0);
  const M = A * ((1 - E2 / 4 - (3 * E2 ** 2) / 64 - (5 * E2 ** 3) / 256) * phi - ((3 * E2) / 8 + (3 * E2 ** 2) / 32 + (45 * E2 ** 3) / 1024) * Math.sin(2 * phi) + ((15 * E2 ** 2) / 256 + (45 * E2 ** 3) / 1024) * Math.sin(4 * phi) - ((35 * E2 ** 3) / 3072) * Math.sin(6 * phi));
  const easting = K0 * N * (Aa + ((1 - T + C) * Aa ** 3) / 6 + ((5 - 18 * T + T ** 2 + 72 * C - 58 * EP2) * Aa ** 5) / 120) + 500000;
  let northing = K0 * (M + N * Math.tan(phi) * (Aa ** 2 / 2 + ((5 - T + 9 * C + 4 * C ** 2) * Aa ** 4) / 24 + ((61 - 58 * T + T ** 2 + 600 * C - 330 * EP2) * Aa ** 6) / 720));
  const south = lat < 0; if (south) northing += 10000000;
  return { zone, band: bandOf(lat), easting, northing, south };
}
export function fromUtm(u: Utm): { lat: number; lon: number } {
  const x = u.easting - 500000, y = u.south ? u.northing - 10000000 : u.northing;
  const M = y / K0, mu = M / (A * (1 - E2 / 4 - (3 * E2 ** 2) / 64 - (5 * E2 ** 3) / 256));
  const e1 = (1 - Math.sqrt(1 - E2)) / (1 + Math.sqrt(1 - E2));
  const phi1 = mu + ((3 * e1) / 2 - (27 * e1 ** 3) / 32) * Math.sin(2 * mu) + ((21 * e1 ** 2) / 16 - (55 * e1 ** 4) / 32) * Math.sin(4 * mu) + ((151 * e1 ** 3) / 96) * Math.sin(6 * mu) + ((1097 * e1 ** 4) / 512) * Math.sin(8 * mu);
  const N1 = A / Math.sqrt(1 - E2 * Math.sin(phi1) ** 2), T1 = Math.tan(phi1) ** 2, C1 = EP2 * Math.cos(phi1) ** 2, R1 = (A * (1 - E2)) / (1 - E2 * Math.sin(phi1) ** 2) ** 1.5, D = x / (N1 * K0);
  const lat = phi1 - ((N1 * Math.tan(phi1)) / R1) * (D ** 2 / 2 - ((5 + 3 * T1 + 10 * C1 - 4 * C1 ** 2 - 9 * EP2) * D ** 4) / 24 + ((61 + 90 * T1 + 298 * C1 + 45 * T1 ** 2 - 252 * EP2 - 3 * C1 ** 2) * D ** 6) / 720);
  const lon = (D - ((1 + 2 * T1 + C1) * D ** 3) / 6 + ((5 - 2 * C1 + 28 * T1 - 3 * C1 ** 2 + 8 * EP2 + 24 * T1 ** 2) * D ** 5) / 120) / Math.cos(phi1);
  return { lat: (lat * 180) / Math.PI, lon: ((u.zone - 1) * 6 - 180 + 3) + (lon * 180) / Math.PI };
}
export const formatUtm = (u: Utm) => `${u.zone}${u.band} ${Math.round(u.easting)} ${Math.round(u.northing)}`;
