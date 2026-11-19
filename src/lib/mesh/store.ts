import { db, getKV, setKV } from '../../db/dexie';
import { deriveChannel, newIdentity, b64u, unb64u, type ChannelKey, type Identity } from './crypto';
import { LIMITS, PUBLIC, type Msg } from './protocol';
import type { StoreLike } from './sync';

export const dbStore: StoreLike & { list(ch: string, limit?: number): Promise<Msg[]>; prune(now?: number): Promise<void>; markMine(id: string): Promise<void> } = {
  has: async (id) => !!(await db.meshMsgs.get(id)),
  put: async (m) => { await db.meshMsgs.put({ id: m.id, ch: m.ch, from: m.from, ts: m.ts, json: JSON.stringify(m), mine: 0 }); },
  ids: async () => (await db.meshMsgs.toCollection().primaryKeys()) as string[],
  all: async () => (await db.meshMsgs.toArray()).map((r) => JSON.parse(r.json) as Msg),
  list: async (ch, limit = 200) => (await db.meshMsgs.where('ch').equals(ch).toArray()).sort((a, b) => a.ts - b.ts).slice(-limit).map((r) => JSON.parse(r.json) as Msg),
  markMine: async (id) => { await db.meshMsgs.update(id, { mine: 1 }); },
  /** Drops old messages and keeps the newest `maxStored` (own messages last to go). */
  async prune(now = Date.now(), maxAge = LIMITS.maxAgeMs) {
    await db.meshMsgs.where('ts').below(now - maxAge).delete();
    const n = await db.meshMsgs.count();
    if (n > LIMITS.maxStored) {
      const rows = (await db.meshMsgs.orderBy('ts').toArray()).sort((a, b) => a.mine - b.mine || a.ts - b.ts);
      await db.meshMsgs.bulkDelete(rows.slice(0, n - LIMITS.maxStored).map((r) => r.id));
    }
  },
};

export const loadIdentity = () => getKV<Identity | null>('mesh.identity', null);
export async function ensureIdentity(name: string): Promise<Identity> { const e = await loadIdentity(); if (e) return e; const id = newIdentity(name); await setKV('mesh.identity', id); return id; }
export const renameIdentity = async (name: string) => { const i = await loadIdentity(); if (i) await setKV('mesh.identity', { ...i, name: name.trim().slice(0, LIMITS.maxName) || i.name }); };

export interface Channel { id: string; name: string; key: string; at: number }
export const loadChannels = () => getKV<Channel[]>('mesh.channels', []);
export async function addChannel(name: string, pass: string): Promise<Channel> {
  const k = await deriveChannel(pass); const list = await loadChannels();
  const ex = list.find((c) => c.id === k.id); if (ex) return ex;
  const c: Channel = { id: k.id, name: name.trim().slice(0, 32) || k.id, key: b64u(k.raw), at: Date.now() };
  await setKV('mesh.channels', [...list, c]); return c;
}
export const removeChannel = async (id: string) => setKV('mesh.channels', (await loadChannels()).filter((c) => c.id !== id));
export const keyMap = (cs: Channel[]) => new Map<string, ChannelKey>(cs.map((c) => [c.id, { id: c.id, raw: unb64u(c.key) }]));
export { PUBLIC };
