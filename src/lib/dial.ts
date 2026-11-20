// Compass dial helpers.
export const normDeg = (d: number) => ((d % 360) + 360) % 360;
/** Compass ring ticks: every 2 degrees, long every 10 and the label every 30. Returns angles from north, clockwise. */
export const ticks = () => Array.from({ length: 180 }, (_, i) => ({ deg: i * 2, long: (i * 2) % 10 === 0, label: (i * 2) % 30 === 0 }));
/** Shortest signed difference between two headings (-180..180), used to smooth a jittery sensor. */
export const angleDelta = (from: number, to: number) => ((((to - from) % 360) + 540) % 360) - 180;
/** Low-pass filter on a circular value (0 < k <= 1). */
export const smooth = (prev: number | null, next: number, k = 0.25) => (prev == null ? normDeg(next) : normDeg(prev + angleDelta(prev, next) * k));
