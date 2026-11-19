/** Content pack updates (spec §6.4): only when online, never in Crisis Mode, checksum-verified, and a failed update keeps the old pack. */
import { db, getKV } from '../db/dexie';

export interface PackInfo { id: string; lang: string; version: string; bytes: number; sha256: string; url: string; installed: boolean }
export interface PackUpdater {
  list(): Promise<PackInfo[]>;
  install(id: string): Promise<boolean>;
  remove(id: string): Promise<void>;
  checkForUpdates(): Promise<PackInfo[]>;
}
export async function sha256Hex(buf: ArrayBuffer): Promise<string> {
  return [...new Uint8Array(await crypto.subtle.digest('SHA-256', buf))].map((b) => b.toString(16).padStart(2, '0')).join('');
}
export interface Deps { baseUrl: string; fetchFn?: typeof fetch; isCrisis?: () => Promise<boolean>; online?: () => boolean }

export function createPackUpdater(d: Deps): PackUpdater {
  const f = d.fetchFn ?? fetch;
  const blocked = async () => (d.online ? !d.online() : false) || ((await d.isCrisis?.()) ?? false);
  const remote = async (): Promise<Omit<PackInfo, 'installed'>[]> => {
    const r = await f(`${d.baseUrl}/manifest.json`); if (!r.ok) throw new Error('manifest');
    const m = await r.json(); return Object.entries<any>(m.packs).map(([id, p]) => ({ id, ...p }));
  };
  const self: PackUpdater = {
    async list() {
      const rows = await db.packs.toArray();
      return rows.map((p) => ({ id: p.id, lang: p.lang, version: p.version, bytes: p.bytes, sha256: p.sha256, url: '', installed: true }));
    },
    async checkForUpdates() {
      if (await blocked()) return [];
      try {
        const have = new Map((await db.packs.toArray()).map((p) => [p.id, p.version]));
        return (await remote()).filter((p) => have.get(p.id) !== p.version).map((p) => ({ ...p, installed: have.has(p.id) }));
      } catch { return []; }
    },
    async install(id) {
      if (await blocked()) return false;
      try {
        const p = (await remote()).find((x) => x.id === id); if (!p) return false;
        const r = await f(p.url); if (!r.ok) return false;
        const buf = await r.arrayBuffer();
        if ((await sha256Hex(buf)) !== p.sha256) return false; // integrity failure: keep the current pack
        const json = new TextDecoder().decode(buf); JSON.parse(json);
        await db.packs.put({ id, lang: p.lang, version: p.version, sha256: p.sha256, bytes: buf.byteLength, json });
        return true;
      } catch { return false; }
    },
    remove: async (id) => { await db.packs.delete(id); },
  };
  return self;
}
export const packUpdater: PackUpdater = createPackUpdater({
  baseUrl: '', online: () => false, isCrisis: async () => !!(await getKV('crisis', null)),
}); // inert until FLAGS.packUpdates and a real baseUrl are configured
