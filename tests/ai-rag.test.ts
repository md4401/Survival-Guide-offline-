import { describe, it, expect } from 'vitest';
import { classify, verify, buildMessages, trimWords, stripThink, ask, toExcerpt } from '../src/ai/rag';
import { buildIndex } from '../src/search';
import { recommendedTier, isValidRepo, MODELS } from '../src/ai/models';
import type { Guide } from '../src/content/types';

const g = (id: string, title: string, o: Partial<Guide> = {}): Guide => ({
  id, kind: 'guide', category: 'x', plan: 'free', vital: false, status: 'published', needsReview: false, title, summary: '', minutes: 0,
  now: [], materials: [], related: [], mistakes: [], understand: [], review: { date: '2026-01-01', level: 'official', source: 's' }, tags: [], ...o,
});
const filter = g('water.diy-filter', 'How to make a homemade water filter', { now: ['Let dirty water settle 1 to 2 hours.', 'Boil for 1 minute.', 'Store in a clean container.'], summary: 'Layered filter from a PET bottle.' });
const camp = g('shelter.camp-setup', 'How to set up a campsite', { now: ['Camp 60 metres from rivers.'] });
const draft = g('firstaid.cpr', 'CPR in adults', { status: 'draft' });
const guides = [filter, camp, draft];
const index = buildIndex(guides.filter((x) => x.status === 'published'));
const ex = [toExcerpt(filter)];

describe('guards', () => {
  it('life-risk words go straight to the vital guide, in both languages', () => {
    expect(classify('he is not breathing')).toEqual({ kind: 'vital', guideId: 'firstaid.cpr' });
    expect(classify('muito sangramento no braço')).toEqual({ kind: 'vital', guideId: 'firstaid.bleeding' });
    expect(classify('meu filho engasgou')).toEqual({ kind: 'vital', guideId: 'firstaid.choking' });
  });
  it('doses, diagnoses and weapons are blocked', () => {
    expect(classify('how many mg of ibuprofen can I take')).toEqual({ kind: 'blocked', topic: 'dose' });
    expect(classify('que doença eu tenho?')).toEqual({ kind: 'blocked', topic: 'diagnosis' });
    expect(classify('how to make a weapon')).toEqual({ kind: 'blocked', topic: 'danger' });
  });
  it('normal questions pass', () => expect(classify('how do I filter water')).toEqual({ kind: 'normal' }));
});

describe('verification of generated answers', () => {
  it('accepts an answer that cites a guide and only uses numbers from it', () => {
    expect(verify('1. Let the water settle for 2 hours [water.diy-filter]\n2. Boil it for 1 minute.', ex).ok).toBe(true);
  });
  it('rejects missing citation, citation of an unknown guide, empty, and invented numbers', () => {
    expect(verify('Boil it for 1 minute.', ex)).toEqual({ ok: false, reason: 'no-citation' });
    expect(verify('Boil it [other.guide]', ex)).toEqual({ ok: false, reason: 'no-citation' });
    expect(verify('  ', ex)).toEqual({ ok: false, reason: 'empty' });
    expect(verify('Boil for 10 minutes [water.diy-filter]', ex)).toEqual({ ok: false, reason: 'unknown-number' });
  });
  it('trims to 200 words and strips <think> blocks', () => {
    expect(trimWords('a '.repeat(300), 200).split(/\s+/).length).toBe(200);
    expect(stripThink('<think>hmm</think>Answer [x]')).toBe('Answer [x]');
    expect(stripThink('<think>unfinished')).toBe('');
  });
  it('prompt restricts the model to the excerpts and asks for citations', () => {
    const m = buildMessages('pt', 'como filtrar?', ex, true);
    expect(m[0].content).toContain('Portuguese'); expect(m[0].content).toContain('[water.diy-filter]'); expect(m[1].content).toContain('/no_think');
    expect(m[0].content).toContain('ONLY');
  });
});

describe('ask() orchestration', () => {
  const base = { index, guides, locale: 'en' };
  it('vital → guide, generator never called', async () => {
    let called = false;
    const r = await ask('someone is not breathing', { ...base, generate: async () => { called = true; return ''; } });
    expect(r).toEqual({ kind: 'vital', guideId: 'firstaid.cpr' }); expect(called).toBe(false);
  });
  it('without a model it returns the matching guides', async () => {
    const r = await ask('water filter', { ...base, generate: null });
    expect(r.kind).toBe('guides'); if (r.kind === 'guides') { expect(r.reason).toBe('no-model'); expect(r.excerpts[0].id).toBe('water.diy-filter'); }
  });
  it('good answer passes; bad answer falls back to guides; errors fall back too', async () => {
    const ok = await ask('water filter', { ...base, generate: async () => 'Boil for 1 minute [water.diy-filter]' });
    expect(ok.kind).toBe('answer');
    const bad = await ask('water filter', { ...base, generate: async () => 'Boil for 99 minutes [water.diy-filter]' });
    expect(bad).toMatchObject({ kind: 'guides', reason: 'rejected' });
    const err = await ask('water filter', { ...base, generate: async () => { throw new Error('oom'); } });
    expect(err).toMatchObject({ kind: 'guides', reason: 'error' });
  });
  it('nothing relevant → "no result" (the model is not asked to answer from memory)', async () => {
    let called = false;
    expect((await ask('quantum chromodynamics lagrangian', { ...base, generate: async () => { called = true; return 'x'; } })).kind).toBe('noresult');
    expect(called).toBe(false);
  });
  it('draft guides are never used as context', async () => {
    const r = await ask('CPR adults', { ...base, generate: null });
    expect(r.kind === 'guides' ? r.excerpts.some((e) => e.id === 'firstaid.cpr') : false).toBe(false);
  });
});

describe('model catalog', () => {
  it('recommends a tier by RAM (spec §6.9)', () => {
    expect([2, 4, 6, 8, undefined].map(recommendedTier)).toEqual(['tiny', 'lite', 'standard', 'pro', 'lite']);
  });
  it('validates custom repo ids and has unique ids', () => {
    expect(isValidRepo('onnx-community/Qwen3-0.6B-ONNX')).toBe(true); expect(isValidRepo('nope')).toBe(false); expect(isValidRepo('a/b/c')).toBe(false);
    expect(new Set(MODELS.map((m) => m.id)).size).toBe(MODELS.length);
  });
});
