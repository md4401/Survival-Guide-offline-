import { Capacitor, registerPlugin } from '@capacitor/core';
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

interface NativeMag { isAvailable(): Promise<{ available: boolean }>; start(): Promise<void>; stop(): Promise<void>; addListener(ev: 'reading', cb: (d: { x: number; y: number; z: number }) => void): Promise<{ remove(): Promise<void> }> }
const Native = registerPlugin<NativeMag>('Magnetometer');
/** True when a magnetic sensor can be read: natively in the Android app, or through the web Generic Sensor API. */
export async function available(): Promise<boolean> {
  if (Capacitor.isNativePlatform()) { try { return (await Native.isAvailable()).available; } catch { return false; } }
  return supported();
}
/** Starts reading; returns a function that stops it. Throws if the sensor cannot start. */
export async function startSensor(onReading: (x: number, y: number, z: number) => void, onError: () => void): Promise<() => void> {
  if (Capacitor.isNativePlatform()) {
    const h = await Native.addListener('reading', (d) => onReading(d.x, d.y, d.z)); await Native.start();
    return () => { void Native.stop().catch(() => {}); void h.remove(); };
  }
  const s = new (globalThis as any).Magnetometer({ frequency: 20 });
  s.addEventListener('reading', () => onReading(s.x, s.y, s.z)); s.addEventListener('error', onError); s.start();
  return () => { try { s.stop(); } catch { /* ignore */ } };
}
