import { describe, it, expect } from 'vitest';
import { validateAll, MAX_WORDS } from '../scripts/validate-content';
import { loadRaw } from '../scripts/lib/content';

describe('content validation', () => {
  it('shipped content has no issues', () => {
    expect(validateAll()).toEqual([]);
  });
  it('every published step has at most 12 words', () => {
    for (const lang of ['en', 'pt']) for (const { raw } of loadRaw(lang))
      for (const s of raw.now ?? []) expect(String(s).split(/\s+/).length).toBeLessThanOrEqual(MAX_WORDS);
  });
  it('vital content is never premium', () => {
    for (const lang of ['en', 'pt']) for (const { raw } of loadRaw(lang)) if (raw.vital) expect(raw.plan).toBe('free');
  });
  it('en and pt have the same ids', () => {
    const ids = (l: string) => loadRaw(l).map((i) => i.raw.id).sort();
    expect(ids('en')).toEqual(ids('pt'));
  });
  it('the 8 MVP scenarios exist', () => {
    const ids = loadRaw('en').map((i) => i.raw.id);
    for (const s of ['blackout', 'storm', 'flood', 'house-fire', 'heatwave', 'coldwave', 'earthquake', 'lost'])
      expect(ids).toContain(`scenario.${s}`);
  });
});
