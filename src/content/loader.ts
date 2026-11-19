import type { Guide, Lang, Pack } from './types';
import { getSettings } from '../db/settings';

const loaders: Record<string, () => Promise<{ default: Pack }>> = {
  en: () => import('../generated/content.en.json') as any,
  pt: () => import('../generated/content.pt.json') as any,
};
const cache = new Map<string, Guide[]>();

/** Returns guides for the locale; falls back to English (with flag) if the language pack is missing. */
export async function loadGuides(lang: Lang = getSettings().locale): Promise<{ guides: Guide[]; fallback: boolean }> {
  const use = loaders[lang] ? lang : 'en';
  if (!cache.has(use)) cache.set(use, (await loaders[use]()).default.guides);
  const all = cache.get(use)!;
  const visible = getSettings().dev ? all : all.filter((g) => g.status === 'published');
  return { guides: visible, fallback: use !== lang };
}
export async function getGuide(id: string): Promise<Guide | undefined> {
  return (await loadGuides()).guides.find((g) => g.id === id);
}
