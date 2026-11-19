// Message envelope: signed by the sender's device key, optionally encrypted for a private channel, relayed hop by hop.
import { dec, decryptText, enc, encryptText, fromHex, sha256, sign, toHex, verifySig, type ChannelKey, type Identity } from './crypto';

export const PUBLIC = 'public';
export const LIMITS = { maxBody: 600, maxName: 32, maxHops: 8, maxFutureMs: 3600e3, maxAgeMs: 7 * 86400e3, maxStored: 2000, maxPerFrame: 60 } as const;
export type Kind = 'text' | 'sos';
export interface Msg { v: 1; id: string; ch: string; from: string; name: string; ts: number; kind: Kind; enc: 0 | 1; iv: string; body: string; sig: string; hops: number }

/** Bytes that are signed and hashed: everything except `hops` (which relays change). */
export const canonical = (m: Pick<Msg, 'v' | 'ch' | 'from' | 'name' | 'ts' | 'kind' | 'enc' | 'iv' | 'body'>) => enc.encode(JSON.stringify([m.v, m.ch, m.from, m.name, m.ts, m.kind, m.enc, m.iv, m.body]));
export const idOf = async (bytes: Uint8Array) => toHex(await sha256(bytes)).slice(0, 24);

export async function createMessage(id: Identity, ch: { id: string; key?: ChannelKey }, text: string, kind: Kind = 'text', now = Date.now()): Promise<Msg> {
  const clean = text.trim().slice(0, LIMITS.maxBody);
  let body = clean, iv = '', e: 0 | 1 = 0;
  if (ch.id !== PUBLIC) {
    if (!ch.key) throw new Error('private channel needs a key');
    const r = await encryptText(ch.key.raw, clean, `${ch.id}|${id.pub}`); body = r.ct; iv = r.iv; e = 1;
  }
  const base = { v: 1 as const, ch: ch.id, from: id.pub, name: id.name, ts: now, kind, enc: e, iv, body };
  const bytes = canonical(base);
  return { ...base, id: await idOf(bytes), sig: sign(id.secret, bytes), hops: 0 };
}

export type Reject = 'format' | 'size' | 'time' | 'id' | 'signature';
export async function verifyMessage(m: unknown, now = Date.now()): Promise<{ ok: true; msg: Msg } | { ok: false; reason: Reject }> {
  const x = m as Msg;
  if (!x || typeof x !== 'object' || x.v !== 1 || ![x.id, x.ch, x.from, x.name, x.iv, x.body, x.sig].every((s) => typeof s === 'string')) return { ok: false, reason: 'format' };
  if ((x.kind !== 'text' && x.kind !== 'sos') || (x.enc !== 0 && x.enc !== 1) || !Number.isFinite(x.ts) || !Number.isInteger(x.hops) || x.hops < 0 || x.hops > LIMITS.maxHops) return { ok: false, reason: 'format' };
  if (!/^[0-9a-f]{64}$/.test(x.from) || !/^[0-9a-f]{128}$/.test(x.sig) || x.ch.length > 32 || (x.ch === PUBLIC) !== (x.enc === 0)) return { ok: false, reason: 'format' };
  if (x.name.length > LIMITS.maxName || x.body.length > LIMITS.maxBody * 2 || x.iv.length > 32) return { ok: false, reason: 'size' };
  if (x.ts > now + LIMITS.maxFutureMs || x.ts < now - LIMITS.maxAgeMs) return { ok: false, reason: 'time' };
  const bytes = canonical(x);
  if ((await idOf(bytes)) !== x.id) return { ok: false, reason: 'id' };
  if (!verifySig(x.from, x.sig, bytes)) return { ok: false, reason: 'signature' };
  return { ok: true, msg: { v: 1, id: x.id, ch: x.ch, from: x.from, name: x.name, ts: x.ts, kind: x.kind, enc: x.enc, iv: x.iv, body: x.body, sig: x.sig, hops: x.hops } };
}
/** Plain text of a message for this device, or null when it belongs to a private channel we have no key for (we still carry it for others). */
export async function readText(m: Msg, keys: Map<string, ChannelKey>): Promise<string | null> {
  if (m.enc === 0) return m.body;
  const k = keys.get(m.ch); return k ? decryptText(k.raw, m.iv, m.body, `${m.ch}|${m.from}`) : null;
}
export { dec as _dec, fromHex as _fromHex };
