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
