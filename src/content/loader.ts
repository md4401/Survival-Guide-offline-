import type { Guide, Lang, Pack } from './types';
import { getSettings } from '../db/settings';
import { db } from '../db/dexie';

const loaders: Record<string, () => Promise<{ default: Pack }>> = {
  en: () => import('../generated/content.en.json') as any,
  pt: () => import('../generated/content.pt.json') as any,
};
const cache = new Map<string, Guide[]>();

/** Returns guides for the locale; falls back to English (with flag) if the language pack is missing. */
export async function loadGuides(lang: Lang = getSettings().locale): Promise<{ guides: Guide[]; fallback: boolean }> {
  const use = loaders[lang] ? lang : 'en';
  if (!cache.has(use)) {
    const bundled = (await loaders[use]()).default;
    let guides = bundled.guides;
    try { // a downloaded pack replaces the bundled one only if it is newer
      const row = await db.packs.get(`core.${use}`);
      if (row && row.version > bundled.version) guides = (JSON.parse(row.json) as Pack).guides;
    } catch { /* storage unavailable */ }
    cache.set(use, guides);
  }
  const all = cache.get(use)!;
  const visible = getSettings().dev ? all : all.filter((g) => g.status === 'published');
  return { guides: visible, fallback: use !== lang };
}
export async function getGuide(id: string): Promise<Guide | undefined> {
  return (await loadGuides()).guides.find((g) => g.id === id);
}
