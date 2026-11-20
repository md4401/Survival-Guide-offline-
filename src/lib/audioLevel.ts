// Sound level estimate from microphone samples. NOT calibrated: a phone microphone has automatic gain and an unknown response.
export const rms = (xs: ArrayLike<number>): number => { let s = 0; for (let i = 0; i < xs.length; i++) s += xs[i] * xs[i]; return xs.length ? Math.sqrt(s / xs.length) : 0; };
/** Relative level in dB: 20·log10(rms) + offset, where offset lets the user align the reading with a reference meter. Clamped to 0–140. */
export const toDb = (r: number, offset = 90): number => (r <= 0 ? 0 : Math.min(140, Math.max(0, 20 * Math.log10(r) + offset)));
export type Band = 'quiet' | 'moderate' | 'loud' | 'veryloud';
/** Rough guide only. 85 dB is the commonly cited level where long exposure starts to risk hearing. */
export const bandOf = (db: number): Band => (db < 40 ? 'quiet' : db < 70 ? 'moderate' : db < 85 ? 'loud' : 'veryloud');
export class Stats {
  min = Infinity; max = -Infinity; private sum = 0; n = 0;
  add(v: number) { this.min = Math.min(this.min, v); this.max = Math.max(this.max, v); this.sum += v; this.n++; }
  get avg() { return this.n ? this.sum / this.n : 0; }
  reset() { this.min = Infinity; this.max = -Infinity; this.sum = 0; this.n = 0; }
}

export const DIAL_MIN = 20, DIAL_MAX = 120, DIAL_HALF_SWEEP = 70;
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
/** Needle angle in degrees (0 = straight up) for a dial that runs from 20 to 120 dB over 140 degrees. */
export const needleAngle = (db: number) => ((clamp(db, DIAL_MIN, DIAL_MAX) - DIAL_MIN) / (DIAL_MAX - DIAL_MIN)) * (2 * DIAL_HALF_SWEEP) - DIAL_HALF_SWEEP;
/** Everyday sounds around each level (approximate, for orientation only). Names: i18n `spl.ex.<level>`. */
export const SOUND_LEVELS = [20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120] as const;
export const soundLevel = (db: number): number => { let r = SOUND_LEVELS[0] as number; for (const l of SOUND_LEVELS) if (db >= l) r = l; return r; };
/** Colour of a level on the scale bar: calm blues and greens, then yellow and red from 85 dB. */
export const levelColor = (db: number) => (db < 40 ? '#6aaee0' : db < 60 ? '#58b08a' : db < 75 ? '#9cd04a' : db < 85 ? '#e6c340' : db < 100 ? '#e8833a' : '#e5503f');
/** Rolling window of readings (default the last 30 seconds) for the time graph. */
export class Series {
  pts: Array<{ t: number; v: number }> = [];
  constructor(readonly windowMs = 30000) {}
  add(t: number, v: number) { this.pts.push({ t, v }); const min = t - this.windowMs; while (this.pts.length && this.pts[0].t < min) this.pts.shift(); }
  reset() { this.pts = []; }
}
