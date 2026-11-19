import { describe, it, expect } from 'vitest';
import { validateAll, MAX_WORDS, wordCount } from '../scripts/validate-content';
import { loadRaw, LANGS, MACHINE_LANGS } from '../scripts/lib/content';

describe('content validation', () => {
  it('shipped content has no issues', () => {
    expect(validateAll()).toEqual([]);
  });
  it('every published step has at most 12 words', () => {
    for (const lang of LANGS) for (const { raw } of loadRaw(lang))
      for (const s of raw.now ?? []) expect(wordCount(String(s), lang)).toBeLessThanOrEqual(MAX_WORDS);
  });
  it('vital content is never premium', () => {
    for (const lang of LANGS) for (const { raw } of loadRaw(lang)) if (raw.vital) expect(raw.plan).toBe('free');
  });
  it('all 7 languages have the same ids', () => {
    const ids = (l: string) => loadRaw(l).map((i) => i.raw.id).sort();
    for (const l of LANGS) expect(ids(l), l).toEqual(ids('en'));
  });
  it('machine-translated languages contain only drafts flagged for review', () => {
    for (const l of MACHINE_LANGS) for (const { raw } of loadRaw(l)) { expect(raw.status, `${l}:${raw.id}`).toBe('draft'); expect(raw.needsReview).toBe(true); }
  });
  it('Chinese word counting is character based', () => { expect(wordCount('请立即拨打急救电话', 'zh')).toBe(5); expect(wordCount('call now please', 'en')).toBe(3); });
  it('the 8 MVP scenarios exist', () => {
    const ids = loadRaw('en').map((i) => i.raw.id);
    for (const s of ['blackout', 'storm', 'flood', 'house-fire', 'heatwave', 'coldwave', 'earthquake', 'lost'])
      expect(ids).toContain(`scenario.${s}`);
  });
});
