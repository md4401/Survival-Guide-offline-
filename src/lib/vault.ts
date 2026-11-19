// Password-protected vault for sensitive copies (documents, family medical file). AES-GCM, key from the password with PBKDF2. Device only.
const enc = new TextEncoder(), dec = new TextDecoder(), ITER = 210000;
const b64 = (u: Uint8Array) => { let s = ''; for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode(...u.subarray(i, i + 0x8000)); return btoa(s); };
const unb64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
export class VaultError extends Error { constructor(public code: 'bad-password' | 'corrupt') { super(code); } }
async function key(pass: string, salt: Uint8Array) {
  const base = await crypto.subtle.importKey('raw', enc.encode(pass), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt: salt as BufferSource, iterations: ITER, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}
export interface Sealed { v: 1; salt: string; iv: string; data: string }
export async function seal(pass: string, value: unknown): Promise<Sealed> {
  const salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12));
  const data = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await key(pass, salt), enc.encode(JSON.stringify(value))));
  return { v: 1, salt: b64(salt), iv: b64(iv), data: b64(data) };
}
export async function open<T>(pass: string, s: Sealed): Promise<T> {
  if (!s || s.v !== 1 || !s.salt || !s.iv || !s.data) throw new VaultError('corrupt');
  let plain: string;
  try { plain = dec.decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(s.iv) as BufferSource }, await key(pass, unb64(s.salt)), unb64(s.data) as BufferSource)); } catch { throw new VaultError('bad-password'); }
  try { return JSON.parse(plain) as T; } catch { throw new VaultError('corrupt'); }
}
export interface VaultData { docs: Array<{ id: string; title: string; text: string; file?: { name: string; type: string; b64: string } }>; family: Array<{ id: string; name: string; blood: string; allergies: string; meds: string; conditions: string; notes: string }> }
export const EMPTY_VAULT: VaultData = { docs: [], family: [] };
export const MAX_FILE = 1024 * 1024;
