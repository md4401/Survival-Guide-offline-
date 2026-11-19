import { FLAGS } from '../flags';
import type { Guide } from './types';
import { licenseStatus, type License } from '../interfaces/license';

/** Vital content is NEVER gated. Premium content needs an active/grace license, and an ongoing crisis never blocks already-downloaded content. */
export function canAccess(g: Pick<Guide, 'vital' | 'plan'>, lic: License | null, opts: { crisisActive?: boolean; nowSec?: number } = {}): boolean {
  if (g.vital || g.plan === 'free') return true;
  if (!FLAGS.premium) return false;
  if (opts.crisisActive) return true;
  return !!lic && licenseStatus(lic, opts.nowSec ?? Date.now() / 1000) !== 'expired';
}
