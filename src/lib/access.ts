import { FLAGS } from '../flags';
import { licenseStatus, type License } from '../interfaces/license';

/** Premium features are usable with an active/grace license while Premium is on, OR in Developer mode (so they can be tried before launch). Vital features never call this. */
export function premiumUnlocked(o: { dev: boolean }, lic: License | null, nowSec = Date.now() / 1000): boolean {
  if (o.dev) return true;
  return FLAGS.premium && !!lic && licenseStatus(lic, nowSec) !== 'expired';
}
