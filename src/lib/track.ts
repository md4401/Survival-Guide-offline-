// GPS breadcrumb trail and "way back" vector. Pure functions; the UI feeds positions.
export interface P { lat: number; lon: number; t: number; acc?: number }
const R = 6371008.8, rad = (d: number) => (d * Math.PI) / 180, deg = (r: number) => (r * 180) / Math.PI;
export function distance(a: P, b: P): number {
  const dLat = rad(b.lat - a.lat), dLon = rad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}
/** Initial compass bearing from a to b, 0..360 (0 = north, clockwise). */
export function bearing(a: P, b: P): number {
  const y = Math.sin(rad(b.lon - a.lon)) * Math.cos(rad(b.lat)), x = Math.cos(rad(a.lat)) * Math.sin(rad(b.lat)) - Math.sin(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.cos(rad(b.lon - a.lon));
  return (deg(Math.atan2(y, x)) + 360) % 360;
}
/** Adds a fix unless it is too close to the last one or too inaccurate (keeps the trail small and clean). */
export function addPoint(track: P[], p: P, minMeters = 8, maxAcc = 60): P[] {
  if (p.acc != null && p.acc > maxAcc) return track;
  const last = track[track.length - 1];
  return last && distance(last, p) < minMeters ? track : [...track, p];
}
export const trackLength = (t: P[]) => t.reduce((n, p, i) => (i ? n + distance(t[i - 1], p) : 0), 0);
/** Where to go to get back: straight line to the start, and along the recorded path (next point back). */
export function wayBack(track: P[], now: P) {
  if (!track.length) return null;
  const start = track[0];
  const direct = { distance: distance(now, start), bearing: bearing(now, start) };
  // follow the breadcrumbs: nearest recorded point, then head to the one before it
  let ni = 0, nd = Infinity; track.forEach((p, i) => { const d = distance(now, p); if (d < nd) { nd = d; ni = i; } });
  const next = track[Math.max(0, ni - 1)];
  return { direct, nextPoint: { distance: distance(now, next), bearing: bearing(now, next) }, atStart: direct.distance < 15 };
}
/** Relative arrow angle for the UI: target bearing minus the device heading. */
export const relativeAngle = (targetBearing: number, heading: number) => (((targetBearing - heading) % 360) + 360) % 360;
