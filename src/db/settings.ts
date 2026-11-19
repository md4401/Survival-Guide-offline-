import { useEffect, useState } from 'preact/hooks';
import { getKV, setKV } from './dexie';
import type { Lang } from '../content/types';

export interface Profile { people: number; kids: number; elderly: number; pets: number; home: 'house' | 'apartment' | ''; region: string }
export interface Settings {
  locale: Lang; theme: 'dark' | 'light' | 'red'; fontScale: number; battery: boolean;
  dev: boolean; country: string; onboarded: boolean;
  units: 'metric' | 'imperial'; hour12: boolean; clockOffsetMs: number; profile: Profile;
}

export const DEFAULTS: Settings = {
  locale: 'en', theme: 'dark', fontScale: 1, battery: false, dev: false, country: '', onboarded: false,
  units: 'metric', hour12: false, clockOffsetMs: 0,
  profile: { people: 2, kids: 0, elderly: 0, pets: 0, home: '', region: '' },
};

let current: Settings = { ...DEFAULTS };
const subs = new Set<() => void>();

export function detectLocale(): Lang {
  const l = (typeof navigator !== 'undefined' ? navigator.language : 'en').slice(0, 2);
  return (['en', 'pt', 'es', 'fr', 'ar', 'hi', 'zh'] as const).find((x) => x === l) ?? 'en';
}

export async function loadSettings() {
  const saved = await getKV<Partial<Settings>>('settings', {});
  current = { ...DEFAULTS, locale: detectLocale(), ...saved, profile: { ...DEFAULTS.profile, ...saved.profile } };
  applyToDocument();
}
export const getSettings = () => current;
export function updateSettings(patch: Partial<Settings>) {
  current = { ...current, ...patch };
  void setKV('settings', current);
  applyToDocument();
  subs.forEach((f) => f());
}
export function useSettings(): Settings {
  const [, tick] = useState(0);
  useEffect(() => { const f = () => tick((n) => n + 1); subs.add(f); return () => { subs.delete(f); }; }, []);
  return current;
}

const RTL = new Set(['ar']);
export const dirFor = (l: string) => (RTL.has(l) ? 'rtl' : 'ltr');

export function applyToDocument() {
  if (typeof document === 'undefined') return;
  const el = document.documentElement;
  el.lang = current.locale;
  el.dir = dirFor(current.locale);
  el.dataset.theme = current.theme;
  el.dataset.battery = current.battery ? '1' : '0';
  el.style.setProperty('--font-scale', String(current.fontScale));
}
