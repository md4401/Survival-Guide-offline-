// Service-worker update prompt: the new version is applied only when the user taps "update", and never offered during a crisis.
import { registerSW } from 'virtual:pwa-register';
import { getKV } from './db/dexie';

let needRefresh = false;
let apply: ((reload?: boolean) => Promise<void>) | null = null;
const subs = new Set<() => void>();
export const updateAvailable = () => needRefresh;
export const onUpdateChange = (f: () => void) => { subs.add(f); return () => { subs.delete(f); }; };
export async function updateAllowed(): Promise<boolean> { return needRefresh && !(await getKV('crisis', null)); }
export const applyUpdate = () => apply?.(true);

export function initPwa() {
  apply = registerSW({ onNeedRefresh() { needRefresh = true; subs.forEach((f) => f()); } });
}
