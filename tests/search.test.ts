import { describe, it, expect } from 'vitest';
import { buildIndex, search } from '../src/search';
import type { Guide } from '../src/content/types';

const g = (id: string, title: string, extra: Partial<Guide> = {}): Guide => ({
  id, kind: 'guide', category: 'x', plan: 'free', vital: false, status: 'published', needsReview: false, title, summary: '',
  minutes: 0, now: [], materials: [], related: [], mistakes: [], understand: [], review: { date: '2026-01-01', level: 'draft', source: 's' }, tags: [], ...extra,
});
const guides = [
  g('w', 'Como fazer um filtro de água caseiro', { tags: ['agua'] }),
  g('c', 'Como escolher e montar um acampamento'),
  g('b', 'Apagão: primeiras 72 horas'),
];
const ms = buildIndex(guides);

describe('offline search', () => {
  it('ignores accents both ways', () => {
    expect(search(ms, 'pt', 'agua')[0].id).toBe('w');
    expect(search(ms, 'pt', 'ÁGUA')[0].id).toBe('w');
    expect(search(ms, 'pt', 'apagao')[0].id).toBe('b');
  });
  it('tolerates typos', () => expect(search(ms, 'pt', 'acampamneto').map((h) => h.id)).toContain('c'));
  it('uses synonyms (luz/energia → apagão)', () => expect(search(ms, 'pt', 'energia').map((h) => h.id)).toContain('b'));
  it('returns nothing for empty query', () => expect(search(ms, 'pt', '  ')).toEqual([]));
});
