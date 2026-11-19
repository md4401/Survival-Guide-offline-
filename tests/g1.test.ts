import { describe, it, expect } from 'vitest';
import { toUtm, fromUtm, formatUtm, utmZone } from '../src/lib/coords';
import { distance, bearing, addPoint, trackLength, wayBack, relativeAngle, type P } from '../src/lib/track';
import { StepCounter, strideFromCalibration, walkedMeters, strideFromHeight } from '../src/lib/steps';

describe('UTM', () => {
  it('zones and the central meridian', () => {
    expect(utmZone(3)).toBe(31); expect(utmZone(-46.6)).toBe(23); expect(utmZone(179.9)).toBe(60); expect(utmZone(-179.9)).toBe(1);
    const u = toUtm(0, 3); expect(u.easting).toBeCloseTo(500000, 3); expect(u.northing).toBeCloseTo(0, 3);
    expect(toUtm(45, 3).easting).toBeCloseTo(500000, 3);
  });
  it('known scale: 1° of latitude at the central meridian ≈ 110.6 km × 0.9996', () => {
    expect(toUtm(1, 3).northing).toBeGreaterThan(110000); expect(toUtm(1, 3).northing).toBeLessThan(111500);
  });
  it('hemispheres and bands', () => {
    const s = toUtm(-23.5505, -46.6333); expect(s.south).toBe(true); expect(s.band).toBe('K'); expect(s.zone).toBe(23); expect(s.northing).toBeGreaterThan(7.3e6);
    expect(toUtm(51.5, -0.1).band).toBe('U'); expect(formatUtm(toUtm(51.5, -0.1))).toMatch(/^30U \d{6} \d{7}$/);
  });
  it('round trip within a millimetre-scale tolerance on several cities', () => {
    for (const [la, lo] of [[48.8584, 2.2945], [-23.5505, -46.6333], [40.6892, -74.0445], [-33.8568, 151.2153], [64.1466, -21.9426], [-1.2921, 36.8219]]) {
      const b = fromUtm(toUtm(la, lo)); expect(Math.abs(b.lat - la)).toBeLessThan(1e-7); expect(Math.abs(b.lon - lo)).toBeLessThan(1e-7);
    }
  });
});
describe('trail and way back', () => {
  const p = (lat: number, lon: number, t = 0, acc?: number): P => ({ lat, lon, t, acc });
  it('distance and bearing on known geometry', () => {
    expect(distance(p(0, 0), p(1, 0))).toBeGreaterThan(110000); expect(distance(p(0, 0), p(1, 0))).toBeLessThan(112000);
    expect(bearing(p(0, 0), p(1, 0))).toBeCloseTo(0, 3); expect(bearing(p(0, 0), p(0, 1))).toBeCloseTo(90, 3);
    expect(bearing(p(0, 0), p(-1, 0))).toBeCloseTo(180, 3); expect(bearing(p(0, 0), p(0, -1))).toBeCloseTo(270, 3);
  });
  it('keeps the trail clean: drops near-duplicates and inaccurate fixes', () => {
    let t: P[] = []; t = addPoint(t, p(0, 0)); t = addPoint(t, p(0.00001, 0)); t = addPoint(t, p(0.001, 0, 1, 500)); t = addPoint(t, p(0.001, 0, 2, 5));
    expect(t.length).toBe(2); expect(trackLength(t)).toBeGreaterThan(100);
  });
  it('way back points to the start and to the previous breadcrumb', () => {
    const t = [p(0, 0), p(0, 0.01), p(0, 0.02)];
    const w = wayBack(t, p(0, 0.0205))!;
    expect(w.direct.bearing).toBeCloseTo(270, 1); expect(w.direct.distance).toBeGreaterThan(2000);
    expect(w.nextPoint.distance).toBeGreaterThan(1000); expect(w.nextPoint.distance).toBeLessThan(1300); expect(w.nextPoint.bearing).toBeCloseTo(270, 1); expect(wayBack([], p(0, 0))).toBeNull(); expect(wayBack(t, p(0, 0.00005))!.atStart).toBe(true);
  });
  it('relative arrow angle wraps', () => { expect(relativeAngle(10, 350)).toBe(20); expect(relativeAngle(350, 10)).toBe(340); });
});
describe('step counter', () => {
  const walk = (steps: number, hz = 2, rate = 50) => {
    const out = []; const n = Math.round((steps / hz) * rate);
    for (let i = 0; i < n; i++) { const t = (i / rate) * 1000; out.push({ t, x: 0, y: 0.3 * Math.sin(2 * Math.PI * hz * (t / 1000)), z: 9.8 + 3 * Math.sin(2 * Math.PI * hz * (t / 1000)) }); }
    return out;
  };
  it('counts about the right number of steps for a steady walk', () => {
    const c = new StepCounter(); walk(40).forEach((s) => c.push(s)); expect(Math.abs(c.steps - 40)).toBeLessThanOrEqual(3);
  });
  it('ignores a phone lying still and small jitter', () => {
    const c = new StepCounter(); for (let i = 0; i < 500; i++) c.push({ t: i * 20, x: 0, y: 0, z: 9.8 + 0.05 * Math.sin(i) }); expect(c.steps).toBe(0);
  });
  it('stride calibration and distance', () => {
    expect(strideFromCalibration(30, 40)).toBeCloseTo(0.75); expect(walkedMeters(100, 0.75)).toBe(75); expect(strideFromHeight(1.7)).toBeCloseTo(0.7055, 3); expect(strideFromCalibration(30, 0)).toBe(0);
  });
});
