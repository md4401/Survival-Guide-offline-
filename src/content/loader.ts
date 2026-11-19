import type { Guide, Lang, Pack } from './types';
import { getSettings } from '../db/settings';
import { db } from '../db/dexie';

const loaders: Record<string, () => Promise<{ default: Pack }>> = {
  en: () => import('../generated/content.en.json') as any,
  pt: () => import('../generated/content.pt.json') as any,
  es: () => import('../generated/content.es.json') as any,
  fr: () => import('../generated/content.fr.json') as any,
  ar: () => import('../generated/content.ar.json') as any,
  hi: () => import('../generated/content.hi.json') as any,
  zh: () => import('../generated/content.zh.json') as any,
};
const cache = new Map<string, Guide[]>();

/** Pure rule: English and Portuguese are written by hand, so their drafts are shown to everyone (each draft carries a clear "not reviewed" notice).
 *  Machine-translated languages stay hidden from users until a native speaker reviews them: they get the English guides with a notice. */
export function pickVisible(own: Guide[], dev: boolean, lang: string): { guides: Guide[]; useEnglish: boolean } {
  const handWritten = lang === 'en' || lang === 'pt';
  const visible = dev || handWritten ? own : own.filter((g) => g.status === 'published');
  return { guides: visible, useEnglish: lang !== 'en' && visible.length === 0 };
}

async function packGuides(use: string): Promise<Guide[]> {
  if (!cache.has(use)) {
    const bundled = (await loaders[use]()).default;
    let guides = bundled.guides;
    try { // a downloaded pack replaces the bundled one only if it is newer
      const row = await db.packs.get(`core.${use}`);
      if (row && row.version > bundled.version) guides = (JSON.parse(row.json) as Pack).guides;
    } catch { /* storage unavailable */ }
    cache.set(use, guides);
  }
  return cache.get(use)!;
}

/** Returns guides for the locale; falls back to English (with flag) if the language has no visible guides. */
export async function loadGuides(lang: Lang = getSettings().locale): Promise<{ guides: Guide[]; fallback: boolean }> {
  const dev = getSettings().dev;
  const use = loaders[lang] ? lang : 'en';
  const r = pickVisible(await packGuides(use), dev, use);
  if (r.useEnglish || use !== lang) return { guides: pickVisible(await packGuides('en'), dev, 'en').guides, fallback: true };
  return { guides: r.guides, fallback: false };
}
export async function getGuide(id: string): Promise<Guide | undefined> {
  return (await loadGuides()).guides.find((g) => g.id === id);
}
