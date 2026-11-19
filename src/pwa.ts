// Updates of the installed web app (PWA). A new version is applied by itself when it is safe: not during Crisis Mode, and not on the emergency screens.
// In the Android app there is no service worker: the web part is updated by src/lib/liveNative.ts instead.
import { registerSW } from 'virtual:pwa-register';
import { Capacitor } from '@capacitor/core';
import { getKV } from './db/dexie';

let needRefresh = false;
let apply: ((reload?: boolean) => Promise<void>) | null = null;
const subs = new Set<() => void>();
export const updateAvailable = () => needRefresh;
export const onUpdateChange = (f: () => void) => { subs.add(f); return () => { subs.delete(f); }; };
export async function updateAllowed(): Promise<boolean> { return needRefresh && !(await getKV('crisis', null)); }
export const applyUpdate = () => apply?.(true);

const QUIET = ['#/emergency', '#/triage', '#/crisis', '#/torch', '#/whistle', '#/gps', '#/numbers', '#/signal', '#/silent'];
/** True when the user is on a screen where a reload would be unwelcome. */
export const onQuietScreen = (hash = typeof location !== 'undefined' ? location.hash : '') => QUIET.some((q) => hash === q || hash.startsWith(q + '/'));

async function maybeApply() {
  if (!needRefresh || !apply) return;
  if (await getKV('crisis', null)) return;
  if (document.visibilityState === 'visible' && onQuietScreen()) return; // wait until the user leaves the emergency screen or the app
  void apply(true);
}

export function initPwa() {
  if (Capacitor.isNativePlatform()) { // leftovers from older builds must not serve stale files
    void navigator.serviceWorker?.getRegistrations().then((rs) => rs.forEach((r) => void r.unregister())).catch(() => {});
    void caches?.keys().then((ks) => ks.filter((k) => k !== 'ai-runtime' && !/transformers/i.test(k)).forEach((k) => void caches.delete(k))).catch(() => {});
    return;
  }
  apply = registerSW({ onNeedRefresh() { needRefresh = true; subs.forEach((f) => f()); setTimeout(() => void maybeApply(), 1500); } });
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') void maybeApply(); });
  window.addEventListener('hashchange', () => { if (needRefresh && !onQuietScreen()) void maybeApply(); });
}
