// Android glue for live updates: stores the verified bundle in the app's private storage and tells the native side to use it at the next start
// (MainActivity.applyLiveUpdate rolls back automatically if a new bundle never confirms that it runs). Does nothing on the web.
import { Capacitor, WebView } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';
import { App } from '@capacitor/app';
import { getKV, setKV } from '../db/dexie';
import { LIVE_BASE, currentBuild, decide, downloadBundle, fetchManifest, shouldCheck, Stopped, type LiveManifest } from './liveUpdate';

export const isNative = () => Capacitor.isNativePlatform();
export type LiveStatus = { phase: 'idle' | 'checking' | 'downloading' | 'ready' | 'uptodate' | 'needs-apk' | 'error' | 'off'; version?: string; progress?: number; error?: string; lastCheck?: number };
let status: LiveStatus = { phase: 'idle' };
const subs = new Set<() => void>();
const set = (s: Partial<LiveStatus>) => { status = { ...status, ...s }; subs.forEach((f) => f()); };
export const liveStatus = () => status;
export const onLiveStatus = (f: () => void) => { subs.add(f); return () => { subs.delete(f); }; };

const pref = async (key: string) => (await Preferences.get({ key })).value ?? '';
const toBase64 = (b: Uint8Array) => { let s = ''; for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode(...b.subarray(i, i + 0x8000)); return btoa(s); };
export const autoEnabled = () => getKV<boolean>('liveAuto', true);
export const setAuto = (v: boolean) => setKV('liveAuto', v);
let stopFlag = false;

/** Called once the app has rendered: tells the native side that the running bundle works, and removes old bundles. */
export async function confirmBoot(): Promise<void> {
  if (!isNative()) return;
  try {
    if ((await pref('liveState')) === 'trying') await Preferences.set({ key: 'liveState', value: 'ok' });
    const keep = await pref('liveVersion');
    const list = await Filesystem.readdir({ path: 'live', directory: Directory.Data }).catch(() => ({ files: [] as Array<{ name: string }> }));
    for (const f of list.files) if (f.name !== keep) await Filesystem.rmdir({ path: `live/${f.name}`, directory: Directory.Data, recursive: true }).catch(() => {});
  } catch { /* storage unavailable */ }
}
async function stage(m: LiveManifest): Promise<void> {
  const dir = `live/${m.version}`;
  await Filesystem.rmdir({ path: dir, directory: Directory.Data, recursive: true }).catch(() => {});
  await downloadBundle(m, {
    write: (p, b) => Filesystem.writeFile({ path: `${dir}/${p}`, data: toBase64(b), directory: Directory.Data, recursive: true }).then(() => {}),
    onProgress: (d, t) => set({ progress: t ? d / t : 1 }), shouldStop: () => stopFlag,
  });
  const uri = (await Filesystem.getUri({ path: dir, directory: Directory.Data })).uri.replace(/^file:\/\//, '');
  const code = String((await App.getInfo()).build);
  await Preferences.set({ key: 'livePath', value: uri }); await Preferences.set({ key: 'liveVersion', value: m.version });
  await Preferences.set({ key: 'liveApk', value: code }); await Preferences.set({ key: 'liveState', value: 'staged' });
}
/** Downloads a newer bundle if there is one. `manual` ignores the 6-hour limit and the "automatic" switch. */
export async function checkNow(manual = false): Promise<void> {
  if (!isNative() || ['checking', 'downloading'].includes(status.phase)) return;
  if (!manual && !(await autoEnabled())) { set({ phase: 'off' }); return; }
  const last = await getKV<number>('liveLast', 0);
  if (!shouldCheck(last, Date.now(), manual)) return;
  if (typeof navigator !== 'undefined' && !navigator.onLine) { if (manual) set({ phase: 'error', error: 'offline' }); return; }
  if (!manual && (await getKV('crisis', null))) return; // never during Crisis Mode
  set({ phase: 'checking', error: undefined }); stopFlag = false;
  try {
    const m = await fetchManifest(fetch, LIVE_BASE); await setKV('liveLast', Date.now()); set({ lastCheck: Date.now() });
    const apk = Number((await App.getInfo()).build) || 0;
    const d = decide(currentBuild(), apk, m, await pref('liveBad'));
    if (d === 'same' || d === 'bad') { set({ phase: 'uptodate' }); return; }
    if (d === 'needs-apk') { set({ phase: 'needs-apk', version: m?.version }); return; }
    if (d === 'invalid' || !m) throw new Error('invalid manifest');
    if ((await pref('liveState')) === 'staged' && (await pref('liveVersion')) === m.version) { set({ phase: 'ready', version: m.version }); return; }
    set({ phase: 'downloading', version: m.version, progress: 0 });
    await stage(m); set({ phase: 'ready', version: m.version });
  } catch (e) { set({ phase: e instanceof Stopped ? 'idle' : 'error', error: e instanceof Error ? e.message.slice(0, 160) : String(e) }); }
}
/** Switches to the downloaded bundle right now (the app reloads). Without this it is used at the next start. */
export async function applyNow(): Promise<void> {
  if (!isNative() || status.phase !== 'ready') return;
  const path = await pref('livePath'); if (!path) return;
  await Preferences.set({ key: 'liveState', value: 'trying' });
  await WebView.setServerBasePath({ path });
}
/** Starts the background routine: a check a few seconds after start, and the switch when the app goes to the background. */
export function initLiveUpdate(): void {
  if (!isNative()) return;
  void confirmBoot();
  setTimeout(() => { void checkNow(false); }, 10000);
  document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState === 'hidden' && status.phase === 'ready' && !(await getKV('crisis', null))) void applyNow();
  });
}
