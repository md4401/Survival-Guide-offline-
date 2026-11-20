// Minimal Nostr (NIP-01) events for location channels. Kind 20000 = ephemeral, tagged with the geohash.
import { schnorr } from '@noble/curves/secp256k1.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { bytesToHex, hexToBytes, utf8ToBytes } from '@noble/hashes/utils.js';

export const KIND_GEO = 20000;
export interface NEvent { id: string; pubkey: string; created_at: number; kind: number; tags: string[][]; content: string; sig: string }
export const randomSecret = (): string => bytesToHex(crypto.getRandomValues(new Uint8Array(32)));
/** One signing key per channel, derived from a local secret so a person cannot be linked across channels. */
export const channelKey = (secretHex: string, geohash: string): string => bytesToHex(sha256(utf8ToBytes(`${secretHex}:${geohash}`)));
export const pubkeyOf = (sk: string): string => bytesToHex(schnorr.getPublicKey(hexToBytes(sk)));
const ser = (e: Pick<NEvent, 'pubkey' | 'created_at' | 'kind' | 'tags' | 'content'>) => JSON.stringify([0, e.pubkey, e.created_at, e.kind, e.tags, e.content]);
export const eventId = (e: Pick<NEvent, 'pubkey' | 'created_at' | 'kind' | 'tags' | 'content'>): string => bytesToHex(sha256(utf8ToBytes(ser(e))));
export function makeGeoEvent(sk: string, geohash: string, text: string, nick: string, now = Math.floor(Date.now() / 1000)): NEvent {
  const base = { pubkey: pubkeyOf(sk), created_at: now, kind: KIND_GEO, tags: [['g', geohash], ...(nick ? [['n', nick.slice(0, 32)]] : [])], content: text.slice(0, 500) };
  const id = eventId(base);
  return { ...base, id, sig: bytesToHex(schnorr.sign(hexToBytes(id), hexToBytes(sk))) };
}
export function verifyEvent(e: NEvent): boolean {
  try { return e.id === eventId(e) && schnorr.verify(hexToBytes(e.sig), hexToBytes(e.id), hexToBytes(e.pubkey)); } catch { return false; }
}
export const geoOf = (e: NEvent) => e.tags.find((t) => t[0] === 'g')?.[1] ?? '';
export const nickOf = (e: NEvent) => e.tags.find((t) => t[0] === 'n')?.[1] ?? '';
export const shortId = (pub: string) => pub.slice(0, 4);
/** Default public relays. The user can edit this list; nothing is sent until they opt in. */
export const DEFAULT_RELAYS = ['wss://relay.damus.io', 'wss://nos.lol', 'wss://relay.primal.net'];
