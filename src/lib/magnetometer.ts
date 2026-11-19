// Metal (iron/magnet) hint from the magnetic field strength. The Earth's field is about 25–65 µT; nearby iron or magnets change it.
export const magnitude = (x: number, y: number, z: number) => Math.hypot(x, y, z);
export class Baseline {
  private sum = 0; n = 0;
  constructor(private readonly need = 20) {}
  add(v: number) { if (this.n < this.need) { this.sum += v; this.n++; } }
  get ready() { return this.n >= this.need; }
  get value() { return this.n ? this.sum / this.n : 0; }
  reset() { this.sum = 0; this.n = 0; }
}
/** 0–1 strength of the deviation from the baseline; `full` µT of change = 1. */
export const strength = (v: number, base: number, full = 40) => Math.min(1, Math.abs(v - base) / full);
/** Beep interval in ms: faster when stronger; null = silent below the noise floor. */
export const beepEvery = (s: number): number | null => (s < 0.05 ? null : Math.round(900 - 800 * s));
export const supported = () => typeof (globalThis as any).Magnetometer === 'function';
