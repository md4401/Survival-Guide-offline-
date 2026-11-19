/** Premium license: signed token verified OFFLINE with a bundled Ed25519 public key (spec §10-11).
 *  Token = base64url(JSON payload) + "." + base64url(signature). Premium stays OFF unless FLAGS.premium is enabled. */
import { getKV, setKV } from '../db/dexie';

export interface License { sub: string; plan: 'premium'; issued: number; expires: number; graceDays: number; devices: number; sig: string }
export type LicenseStatus = 'active' | 'grace' | 'expired';
export interface LicenseService {
  current(): Promise<License | null>;
  verify(token: string): Promise<License | null>;
  activate(token: string): Promise<License | null>;
  restorePurchases(): Promise<License | null>;
}
/** Publisher's Ed25519 public key (hex). null = licensing not configured → nothing verifies. */
export const PUBLIC_KEY_HEX: string | null = null;

const b64 = (s: string) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));
export async function verifyToken(token: string, publicKeyHex: string | null = PUBLIC_KEY_HEX): Promise<License | null> {
  if (!publicKeyHex) return null;
  try {
    const [p, sig] = token.split('.');
    const payload = b64(p);
    const { ed25519 } = await import('@noble/curves/ed25519.js');
    if (!ed25519.verify(b64(sig), payload, Uint8Array.from(publicKeyHex.match(/../g)!.map((h) => parseInt(h, 16))))) return null;
    const j = JSON.parse(new TextDecoder().decode(payload));
    if (j.plan !== 'premium' || typeof j.expires !== 'number') return null;
    return { sub: String(j.sub), plan: 'premium', issued: j.issued, expires: j.expires, graceDays: j.grace_days ?? 30, devices: j.devices ?? 1, sig };
  } catch { return null; }
}
/** Spec §11: Premium for the term; then `graceDays` of read-only access to already downloaded content; then blocked. */
export function licenseStatus(l: License, nowSec: number): LicenseStatus {
  if (nowSec < l.expires) return 'active';
  return nowSec < l.expires + l.graceDays * 86400 ? 'grace' : 'expired';
}
export const licenseService: LicenseService = {
  current: async () => getKV<License | null>('license', null),
  verify: (t) => verifyToken(t),
  activate: async (t) => { const l = await verifyToken(t); if (l) await setKV('license', l); return l; },
  restorePurchases: async () => null, // store receipts need a backend/store plugin: out of scope
};
