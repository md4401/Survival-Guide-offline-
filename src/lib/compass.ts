const CARD = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'] as const;
export type Cardinal = (typeof CARD)[number];
export const normDeg = (d: number) => ((d % 360) + 360) % 360;
/** 0° = north, clockwise. Eight 45° sectors centered on N, NE, E… */
export function headingToCardinal(deg: number): Cardinal { return CARD[Math.floor((normDeg(deg) + 22.5) / 45) % 8]; }

export interface OrientationLike { alpha: number | null; absolute?: boolean; webkitCompassHeading?: number }
/** Compass heading from a deviceorientation event: iOS gives webkitCompassHeading; Android absolute events give alpha (counter-clockwise). null = no usable reading. */
export function headingFromEvent(e: OrientationLike): number | null {
  if (typeof e.webkitCompassHeading === 'number') return normDeg(e.webkitCompassHeading);
  if (e.alpha == null || e.absolute === false) return null;
  return normDeg(360 - e.alpha);
}
