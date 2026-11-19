// Offline sun/moon maths. Sun: NOAA solar calculator equations (accuracy ~1-2 min at mid latitudes).
// Moon: mean synodic month (accuracy about ±0.7 day for phase timing; fine for display).
const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;

/** Julian day at 0h UT of the given calendar date (Gregorian). */
export function julianDay(y: number, m: number, d: number): number {
  if (m <= 2) { y -= 1; m += 12; }
  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + b - 1524.5;
}
export const julianDayOfDate = (dt: Date) =>
  julianDay(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate()) + (dt.getUTCHours() + dt.getUTCMinutes() / 60 + dt.getUTCSeconds() / 3600) / 24;

function sunPosition(jd: number) {
  const t = (jd - 2451545) / 36525;
  const L0 = (((280.46646 + t * (36000.76983 + t * 0.0003032)) % 360) + 360) % 360;
  const M = 357.52911 + t * (35999.05029 - 0.0001537 * t);
  const e = 0.016708634 - t * (0.000042037 + 0.0000001267 * t);
  const C = Math.sin(rad(M)) * (1.914602 - t * (0.004817 + 0.000014 * t)) + Math.sin(rad(2 * M)) * (0.019993 - 0.000101 * t) + Math.sin(rad(3 * M)) * 0.000289;
  const trueLong = L0 + C;
  const omega = 125.04 - 1934.136 * t;
  const lambda = trueLong - 0.00569 - 0.00478 * Math.sin(rad(omega));
  const eps0 = 23 + (26 + (21.448 - t * (46.815 + t * (0.00059 - t * 0.001813))) / 60) / 60;
  const eps = eps0 + 0.00256 * Math.cos(rad(omega));
  const decl = deg(Math.asin(Math.sin(rad(eps)) * Math.sin(rad(lambda))));
  const y = Math.tan(rad(eps) / 2) ** 2;
  const eqTime = 4 * deg(y * Math.sin(2 * rad(L0)) - 2 * e * Math.sin(rad(M)) + 4 * e * y * Math.sin(rad(M)) * Math.cos(2 * rad(L0))
    - 0.5 * y * y * Math.sin(4 * rad(L0)) - 1.25 * e * e * Math.sin(2 * rad(M)));
  return { decl, eqTime, lambda: ((lambda % 360) + 360) % 360 };
}

export interface SunTimes {
  sunrise: Date | null; sunset: Date | null; solarNoon: Date;
  civilDawn: Date | null; civilDusk: Date | null;
  dayLengthMin: number | null; polar: 'day' | 'night' | null;
}

/** Sun events for the UTC calendar date y-m-d at (lat, lon east-positive). Returned as UTC instants. */
export function sunTimes(y: number, m: number, d: number, lat: number, lon: number): SunTimes {
  const jd0 = julianDay(y, m, d);
  const toDate = (min: number) => new Date(Date.UTC(y, m - 1, d) + min * 60000);
  const event = (zenith: number, rising: boolean): number | null => {
    const solve = (jd: number): number | null => {
      const { decl, eqTime } = sunPosition(jd);
      const cosH = (Math.cos(rad(zenith)) - Math.sin(rad(lat)) * Math.sin(rad(decl))) / (Math.cos(rad(lat)) * Math.cos(rad(decl)));
      if (cosH > 1 || cosH < -1) return null;
      const H = deg(Math.acos(cosH));
      return 720 - 4 * (lon + (rising ? H : -H)) - eqTime;
    };
    const first = solve(jd0 + 0.5 - lon / 360);
    if (first === null) return null;
    return solve(jd0 + first / 1440);
  };
  const { eqTime: eq } = sunPosition(jd0 + 0.5 - lon / 360);
  const noon = 720 - 4 * lon - eq;
  const rise = event(90.833, true), set = event(90.833, false);
  const cd = event(96, true), cu = event(96, false);
  let polar: SunTimes['polar'] = null;
  if (rise === null || set === null) {
    const { decl } = sunPosition(jd0 + 0.5);
    // Sun up at noon iff altitude > -0.833°
    const alt = deg(Math.asin(Math.sin(rad(lat)) * Math.sin(rad(decl)) + Math.cos(rad(lat)) * Math.cos(rad(decl))));
    polar = alt > -0.833 ? 'day' : 'night';
  }
  return {
    sunrise: rise === null ? null : toDate(rise), sunset: set === null ? null : toDate(set), solarNoon: toDate(noon),
    civilDawn: cd === null ? null : toDate(cd), civilDusk: cu === null ? null : toDate(cu),
    dayLengthMin: rise !== null && set !== null ? set - rise : polar === 'day' ? 1440 : 0, polar,
  };
}

export type Season = 'spring' | 'summer' | 'autumn' | 'winter';
/** Astronomical season from the Sun's apparent longitude; flipped for the southern hemisphere. */
export function season(date: Date, lat: number): Season {
  const lam = sunPosition(julianDayOfDate(date)).lambda;
  const north: Season[] = ['spring', 'summer', 'autumn', 'winter'];
  const i = Math.floor(lam / 90) % 4;
  return north[lat >= 0 ? i : (i + 2) % 4];
}

export const SYNODIC = 29.530588853;
const NEW_MOON_JD = 2451550.09766; // 2000-01-06 ~14:14 UTC
export type MoonPhaseName = 'new' | 'waxingCrescent' | 'firstQuarter' | 'waxingGibbous' | 'full' | 'waningGibbous' | 'lastQuarter' | 'waningCrescent';
export interface Moon { age: number; fraction: number; illumination: number; name: MoonPhaseName }

export function moon(date: Date): Moon {
  const age = ((((julianDayOfDate(date) - NEW_MOON_JD) % SYNODIC) + SYNODIC) % SYNODIC);
  const fraction = age / SYNODIC;
  const names: MoonPhaseName[] = ['new', 'waxingCrescent', 'firstQuarter', 'waxingGibbous', 'full', 'waningGibbous', 'lastQuarter', 'waningCrescent'];
  return { age, fraction, illumination: (1 - Math.cos(2 * Math.PI * fraction)) / 2, name: names[Math.floor(((fraction + 1 / 16) % 1) * 8)] };
}
/** Next mean new (0) or full (0.5) moon after `date`. */
export function nextMoonEvent(date: Date, target: 0 | 0.5): Date {
  const { age } = moon(date);
  let delta = target * SYNODIC - age;
  if (delta <= 0) delta += SYNODIC;
  return new Date(date.getTime() + delta * 86400000);
}
