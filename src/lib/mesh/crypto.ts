// Identity, signatures and channel encryption for offline messaging. Everything runs on the device.
import { ed25519 } from '@noble/curves/ed25519.js';

export const enc = new TextEncoder(), dec = new TextDecoder();
export const toHex = (b: Uint8Array) => [...b].map((x) => x.toString(16).padStart(2, '0')).join('');
export const fromHex = (h: string) => Uint8Array.from(h.match(/../g) ?? [], (x) => parseInt(x, 16));
export function b64u(b: Uint8Array): string { let s = ''; for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode(...b.subarray(i, i + 0x8000)); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
export function unb64u(s: string): Uint8Array { const p = s.replace(/-/g, '+').replace(/_/g, '/'); return Uint8Array.from(atob(p + '='.repeat((4 - (p.length % 4)) % 4)), (c) => c.charCodeAt(0)); }
export async function sha256(b: Uint8Array): Promise<Uint8Array> { return new Uint8Array(await crypto.subtle.digest('SHA-256', b as BufferSource)); }

export interface Identity { secret: string; pub: string; name: string }
export function newIdentity(name: string): Identity {
  const sk = ed25519.utils.randomSecretKey();
  return { secret: toHex(sk), pub: toHex(ed25519.getPublicKey(sk)), name: name.trim().slice(0, 32) || 'Anon' };
}
export const sign = (secretHex: string, msg: Uint8Array) => toHex(ed25519.sign(msg, fromHex(secretHex)));
export function verifySig(pubHex: string, sigHex: string, msg: Uint8Array): boolean {
  try { return ed25519.verify(fromHex(sigHex), msg, fromHex(pubHex)); } catch { return false; }
}
/** Short readable fingerprint for comparing identities out loud: "a1b2-c3d4-e5f6-0789". */
export const fingerprint = (pubHex: string) => (pubHex.slice(0, 16).match(/.{4}/g) ?? []).join('-');

export interface ChannelKey { id: string; raw: Uint8Array }
/** Private channel key from a shared passphrase (PBKDF2-SHA256). The channel id is a hash of the key, so it can be shared without revealing the passphrase. */
export async function deriveChannel(pass: string, iterations = 100000): Promise<ChannelKey> {
  const base = await crypto.subtle.importKey('raw', enc.encode(pass.normalize('NFKC').trim()), 'PBKDF2', false, ['deriveBits']);
  const raw = new Uint8Array(await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: enc.encode('survival-guide-mesh-v1'), iterations, hash: 'SHA-256' }, base, 256));
  return { raw, id: 'c' + toHex(await sha256(raw)).slice(0, 15) };
}
const aesKey = (raw: Uint8Array) => crypto.subtle.importKey('raw', raw as BufferSource, 'AES-GCM', false, ['encrypt', 'decrypt']);
export async function encryptText(raw: Uint8Array, text: string, aad: string): Promise<{ iv: string; ct: string }> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv, additionalData: enc.encode(aad) }, await aesKey(raw), enc.encode(text)));
  return { iv: b64u(iv), ct: b64u(ct) };
}
export async function decryptText(raw: Uint8Array, iv: string, ct: string, aad: string): Promise<string | null> {
  try { return dec.decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64u(iv) as BufferSource, additionalData: enc.encode(aad) }, await aesKey(raw), unb64u(ct) as BufferSource)); } catch { return null; }
}
/** 16 random characters from an unambiguous alphabet, grouped: "K7QM-2WXD-9FHT-PR4C" (~80 bits). */
export function randomPassphrase(): string {
  const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; const r = crypto.getRandomValues(new Uint8Array(16));
  return [...r].map((x) => A[x % A.length]).join('').match(/.{4}/g)!.join('-');
}
