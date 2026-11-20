import Dexie, { type Table } from 'dexie';

export interface Fav { id: string; at: number }
export interface Hist { id: string; at: number }
export interface Counter { id?: number; name: string; start: number; type: 'up' | 'down' }
export interface Check { key: string; done: boolean }
export interface Note { id?: number; text: string; at: number; title?: string; sketches?: string[]; images?: string[] }
export interface PackRow { id: string; lang: string; version: string; sha256: string; bytes: number; json: string }
export interface MeshRow { id: string; ch: string; from: string; ts: number; json: string; mine: number }
export interface InvItem { id?: number; name: string; qty: number; unit: string; where: string; expires: string; kcal?: number }
export interface Highlight { id?: number; guide: string; text: string; note: string; at: number }
export interface Recording { id?: number; name: string; at: number; ms: number; mime: string; blob: Blob }
export interface EventRow { id?: number; title: string; at: number; note: string; repeat: 'none' | 'daily' | 'weekly' | 'yearly'; dur?: number; allDay?: boolean }
export interface KV { key: string; value: unknown }

class AppDB extends Dexie {
  favorites!: Table<Fav, string>;
  history!: Table<Hist, string>;
  counters!: Table<Counter, number>;
  checklists!: Table<Check, string>;
  notes!: Table<Note, number>;
  kv!: Table<KV, string>;
  packs!: Table<PackRow, string>;
  meshMsgs!: Table<MeshRow, string>;
  inventory!: Table<InvItem, number>;
  highlights!: Table<Highlight, number>;
  recordings!: Table<Recording, number>;
  events!: Table<EventRow, number>;
  constructor() {
    super('survival-guide');
    this.version(1).stores({
      favorites: 'id, at', history: 'id, at', counters: '++id',
      checklists: 'key', notes: '++id, at', kv: 'key',
    });
    this.version(2).stores({ packs: 'id, lang' });
    this.version(3).stores({ meshMsgs: 'id, ch, ts, from' });
    this.version(4).stores({ inventory: '++id, expires, name', highlights: '++id, guide, at' });
    this.version(5).stores({ recordings: '++id, at', events: '++id, at' });
  }
}
/** All user data lives only here, on the device. Nothing is ever sent anywhere. */
export const db = new AppDB();

export async function getKV<T>(key: string, fallback: T): Promise<T> {
  try { const r = await db.kv.get(key); return (r?.value as T) ?? fallback; } catch { return fallback; }
}
export async function setKV(key: string, value: unknown) {
  try { await db.kv.put({ key, value }); } catch { /* storage unavailable: keep running */ }
}
