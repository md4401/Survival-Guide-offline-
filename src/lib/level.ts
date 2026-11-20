// Bubble level maths. beta/gamma come from the device orientation sensor (degrees); the user can calibrate "level" for a surface that is not flat.
export const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
export interface Cal { x: number; y: number }
export const ZERO: Cal = { x: 0, y: 0 };
/** Tilt after calibration. x = left/right (gamma), y = forward/back (beta). */
export const tilt = (beta: number, gamma: number, cal: Cal = ZERO) => ({ x: gamma - cal.x, y: beta - cal.y });
/** Bubble position as -1..1 on each axis; the bubble reaches the edge at `max` degrees of tilt and moves toward the high side. */
export const bubble = (x: number, y: number, max = 20) => ({ x: clamp(x / max, -1, 1), y: clamp(y / max, -1, 1) });
export const isLevel = (x: number, y: number, tol = 0.5) => Math.abs(x) <= tol && Math.abs(y) <= tol;
