// Encrypted local backup (AES-GCM, key from passphrase via PBKDF2). No cloud: the user keeps the file.
import { db } from '../db/dexie';

const ITER = 210000;
const TABLES = ['favorites', 'history', 'counters', 'checklists', 'notes', 'kv', 'inventory', 'highlights'] as const;
const EXCLUDE_KV = new Set(['ai']); // model install state refers to this device's cache
const enc = new TextEncoder();
const b64 = (u: Uint8Array) => { let s = ''; for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode(...u.subarray(i, i + 0x8000)); return btoa(s); };
const unb64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
export class BackupError extends Error { constructor(public code: 'bad-password' | 'corrupt') { super(code); } }

async function key(pass: string, salt: Uint8Array) {
  const base = await crypto.subtle.importKey('raw', enc.encode(pass), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt: salt as BufferSource, iterations: ITER, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}
export async function snapshot() {
  const out: Record<string, unknown[]> = {};
  for (const t of TABLES) {
    const rows = await (db as any)[t].toArray();
    out[t] = t === 'kv' ? rows.filter((r: any) => !EXCLUDE_KV.has(r.key)) : rows;
  }
  return out;
}
export async function exportBackup(pass: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12));
  const data = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await key(pass, salt), enc.encode(JSON.stringify({ at: Date.now(), tables: await snapshot() }))));
  return JSON.stringify({ app: 'survival-guide', v: 1, kdf: 'PBKDF2-SHA256', iter: ITER, salt: b64(salt), iv: b64(iv), data: b64(data) });
}
/** Replaces the current local data with the backup's. Throws BackupError('bad-password' | 'corrupt'). */
export async function importBackup(file: string, pass: string): Promise<void> {
  let j: any;
  try { j = JSON.parse(file); } catch { throw new BackupError('corrupt'); }
  if (j?.app !== 'survival-guide' || j.v !== 1 || !j.salt || !j.iv || !j.data) throw new BackupError('corrupt');
  let plain: string;
  try { plain = new TextDecoder().decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(j.iv) as BufferSource }, await key(pass, unb64(j.salt)), unb64(j.data) as BufferSource)); }
  catch { throw new BackupError('bad-password'); } // wrong passphrase and tampering both fail the GCM tag
  let tables: Record<string, any[]>;
  try { tables = JSON.parse(plain).tables; if (!tables) throw 0; } catch { throw new BackupError('corrupt'); }
  await db.transaction('rw', TABLES.map((t) => (db as any)[t]), async () => {
    for (const t of TABLES) {
      const table = (db as any)[t];
      if (t === 'kv') await table.filter((r: any) => !EXCLUDE_KV.has(r.key)).delete(); else await table.clear();
      if (Array.isArray(tables[t])) await table.bulkPut(tables[t]);
    }
  });
}
