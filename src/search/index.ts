import MiniSearch from 'minisearch';
import type { Guide } from '../content/types';
import { expand, norm } from './synonyms';

export interface Hit { id: string; title: string; summary: string; score: number }

export function buildIndex(guides: Guide[]) {
  const ms = new MiniSearch<Guide & { text: string }>({
    fields: ['title', 'tags', 'summary', 'text'],
    storeFields: ['title', 'summary'],
    processTerm: (t) => norm(t),
    searchOptions: { boost: { title: 3, tags: 2 }, prefix: true, fuzzy: 0.2, combineWith: 'OR' },
  });
  ms.addAll(guides.map((g) => ({ ...g, tags: g.tags.join(' ') as any, text: [...g.now, ...g.understand, ...g.materials, ...g.mistakes].join(' ') })));
  return ms;
}
export function search(ms: MiniSearch, lang: string, q: string): Hit[] {
  if (!q.trim()) return [];
  return ms.search(expand(lang, q)).map((r) => ({ id: r.id as string, title: r.title as string, summary: r.summary as string, score: r.score }));
}
