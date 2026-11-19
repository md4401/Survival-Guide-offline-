// Step counter from accelerometer samples (no GPS needed). Peak detection on the smoothed acceleration magnitude.
export interface Sample { t: number; x: number; y: number; z: number } // t in ms, m/s²
export class StepCounter {
  steps = 0; private smooth = 9.8; private prev = 0; private prev2 = 0; private lastStep = -1e9; private base = 9.8;
  constructor(private threshold = 1.2, private minGapMs = 280, private alpha = 0.35) {}
  push(s: Sample): boolean {
    const mag = Math.hypot(s.x, s.y, s.z);
    this.base += 0.01 * (mag - this.base);                  // slow baseline (gravity)
    this.smooth += this.alpha * (mag - this.smooth);        // low-pass
    const v = this.smooth - this.base;
    const isPeak = this.prev > this.prev2 && this.prev >= v && this.prev > this.threshold;
    const t = s.t;
    this.prev2 = this.prev; this.prev = v;
    if (isPeak && t - this.lastStep >= this.minGapMs) { this.steps++; this.lastStep = t; return true; }
    return false;
  }
}
export const strideFromCalibration = (knownMeters: number, steps: number) => (steps > 0 ? knownMeters / steps : 0);
export const walkedMeters = (steps: number, strideM: number) => steps * strideM;
/** Default stride ≈ 0.415 × height (a common rule of thumb); the user should calibrate by walking a known distance. */
export const strideFromHeight = (heightM: number) => heightM * 0.415;
