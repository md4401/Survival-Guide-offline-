import en from './locales/en.json';
import pt from './locales/pt.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import ar from './locales/ar.json';
import hi from './locales/hi.json';
import zh from './locales/zh.json';
import { getSettings } from '../db/settings';

type Dict = Record<string, string>;
/** en/pt complete in the MVP; es/fr/ar/hi/zh are empty stubs that fall back to English. */
export const LOCALES: Record<string, Dict> = { en, pt, es, fr, ar, hi, zh };
export const MVP_LANGS = ['en', 'pt'] as const;
export const ALL_LANGS = ['en', 'pt', 'es', 'fr', 'ar', 'hi', 'zh'] as const;

export function translate(locale: string, key: string, params?: Record<string, string | number>): string {
  let s = LOCALES[locale]?.[key] ?? LOCALES.en[key] ?? key;
  if (params) for (const [k, v] of Object.entries(params)) s = s.replaceAll(`{${k}}`, String(v));
  return s;
}
/** Use inside components (they re-render on settings change via useSettings in the root). */
export const t = (key: string, params?: Record<string, string | number>) => translate(getSettings().locale, key, params);
/** True when the current locale lacks this key and English is shown instead. */
export const isFallback = (key: string) => !(key in (LOCALES[getSettings().locale] ?? {}));
