import Dexie, { type Table } from 'dexie';

export interface Fav { id: string; at: number }
export interface Hist { id: string; at: number }
export interface Counter { id?: number; name: string; start: number; type: 'up' | 'down' }
export interface Check { key: string; done: boolean }
export interface Note { id?: number; text: string; at: number }
export interface KV { key: string; value: unknown }

class AppDB extends Dexie {
  favorites!: Table<Fav, string>;
  history!: Table<Hist, string>;
  counters!: Table<Counter, number>;
  checklists!: Table<Check, string>;
  notes!: Table<Note, number>;
  kv!: Table<KV, string>;
  constructor() {
    super('survival-guide');
    this.version(1).stores({
      favorites: 'id, at', history: 'id, at', counters: '++id',
      checklists: 'key', notes: '++id, at', kv: 'key',
    });
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
