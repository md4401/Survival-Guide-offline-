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
