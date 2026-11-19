// Live updates of the web part of the app (screens, guides, translations), so the installed APK does not have to be reinstalled.
// The CI publishes every merged build to the `live` branch (manifest + files). The app downloads a newer bundle when it is online,
// checks every file against its SHA-256, and only then marks it for use. A failed or corrupt download changes nothing.
export const LIVE_BASE = 'https://raw.githubusercontent.com/md4401/Survival-Guide-offline-/live';
export interface LiveFile { path: string; size: number; sha256: string }
export interface LiveManifest { version: string; minApk: number; built: number; files: LiveFile[] }
export type Decision = 'same' | 'update' | 'needs-apk' | 'bad' | 'invalid';

export const currentBuild = () => (typeof __BUILD_ID__ !== 'undefined' ? __BUILD_ID__ : 'dev');
const safePath = (p: unknown) => typeof p === 'string' && p.length > 0 && p.length < 200 && !p.startsWith('/') && !p.includes('..') && !p.includes('\\') && !p.includes('//') && /^[\w.\-/@]+$/.test(p);

/** Structural check of a downloaded manifest: only well-formed, relative, hashed files, and an index.html entry. */
export function validManifest(m: any): m is LiveManifest {
  if (!m || typeof m.version !== 'string' || !/^[\w.-]{1,80}$/.test(m.version) || typeof m.minApk !== 'number' || !Array.isArray(m.files) || m.files.length === 0 || m.files.length > 2000) return false;
  const seen = new Set<string>();
  for (const f of m.files) {
    if (!safePath(f?.path) || typeof f.size !== 'number' || f.size < 0 || f.size > 50 * 1048576 || !/^[0-9a-f]{64}$/.test(f.sha256) || seen.has(f.path)) return false;
    seen.add(f.path);
  }
  return seen.has('index.html');
}
/** What to do with a manifest: nothing, update, or tell the user that this version needs a newer APK. */
export function decide(current: string, apkCode: number, m: unknown, bad = ''): Decision {
  if (!validManifest(m)) return 'invalid';
  if (m.version === current) return 'same';
  if (m.version === bad) return 'bad';
  if (m.minApk > apkCode) return 'needs-apk';
  return 'update';
}
export async function sha256Hex(buf: ArrayBuffer | Uint8Array): Promise<string> {
  const view = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  return [...new Uint8Array(await crypto.subtle.digest('SHA-256', view as BufferSource))].map((b) => b.toString(16).padStart(2, '0')).join('');
}
export async function fetchManifest(fetchFn: typeof fetch = fetch, base = LIVE_BASE): Promise<LiveManifest | null> {
  const r = await fetchFn(`${base}/manifest.json?t=${Math.floor(Date.now() / 60000)}`, { cache: 'no-store' });
  if (!r.ok) throw new Error(`manifest HTTP ${r.status}`);
  const m = await r.json(); return validManifest(m) ? m : null;
}
export interface DownloadDeps { fetchFn?: typeof fetch; base?: string; write: (path: string, bytes: Uint8Array) => Promise<void>; onProgress?: (done: number, total: number) => void; shouldStop?: () => boolean }
export class Stopped extends Error {}
/** Downloads every file, checks size and SHA-256, and hands it to `write`. Throws on the first problem; the caller must discard a partial bundle. */
export async function downloadBundle(m: LiveManifest, d: DownloadDeps): Promise<void> {
  const f = d.fetchFn ?? fetch; const base = d.base ?? LIVE_BASE; const total = m.files.reduce((n, x) => n + x.size, 0); let done = 0;
  for (const file of m.files) {
    if (d.shouldStop?.()) throw new Stopped();
    const r = await f(`${base}/files/${file.path}`, { cache: 'no-store' });
    if (!r.ok) throw new Error(`${file.path}: HTTP ${r.status}`);
    const bytes = new Uint8Array(await r.arrayBuffer());
    if (bytes.length !== file.size) throw new Error(`${file.path}: wrong size`);
    if ((await sha256Hex(bytes)) !== file.sha256) throw new Error(`${file.path}: checksum mismatch`);
    await d.write(file.path, bytes); done += file.size; d.onProgress?.(done, total);
  }
}
/** Updates are checked at most this often. */
export const CHECK_EVERY_MS = 6 * 3600e3;
export const shouldCheck = (last: number, now: number, force = false) => force || now - last >= CHECK_EVERY_MS;
