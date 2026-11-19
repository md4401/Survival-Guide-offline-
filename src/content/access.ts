import { FLAGS } from '../flags';
import type { Guide } from './types';
import type { License } from '../interfaces/license';

/** Vital content is NEVER gated. Premium content needs an active license (premium is OFF in the MVP, so it is unreachable). */
export function canAccess(g: Pick<Guide, 'vital' | 'plan'>, lic: License | null): boolean {
  if (g.vital) return true;
  if (g.plan === 'free') return true;
  return FLAGS.premium && !!lic && lic.active;
}
