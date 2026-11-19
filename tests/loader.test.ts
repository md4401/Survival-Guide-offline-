import { describe, it, expect } from 'vitest';
import { pickVisible } from '../src/content/loader';
import type { Guide } from '../src/content/types';

const g = (id: string, status: 'draft' | 'published'): Guide => ({ id, kind: 'guide', category: 'x', plan: 'free', vital: false, status, needsReview: true, title: id, summary: '', minutes: 0, now: [], materials: [], related: [], mistakes: [], understand: [], review: { date: '', level: 'draft', source: '' }, tags: [] });
describe('language fallback rule', () => {
  it('machine-translated draft-only pack → English for normal users', () => {
    expect(pickVisible([g('a', 'draft')], false, 'es')).toEqual({ guides: [], useEnglish: true });
  });
  it('developer mode shows the drafts of the language', () => {
    expect(pickVisible([g('a', 'draft')], true, 'es')).toMatchObject({ useEnglish: false, guides: [{ id: 'a' }] });
  });
  it('a language with published guides keeps its own; English never falls back', () => {
    expect(pickVisible([g('a', 'published'), g('b', 'draft')], false, 'pt').guides.map((x) => x.id)).toEqual(['a']);
    expect(pickVisible([], false, 'en').useEnglish).toBe(false);
  });
});
