import { describe, it, expect } from 'vitest';
import { MYTHS, FACTS, CASES, DIY, GLOSSARY } from '../src/data/library';
import { PHRASES } from '../src/data/phrases';
import { factOfDay, dayIndex, findTerms, heatIndexF, heatIndexC, windChillC, heatBand, findGuides } from '../src/lib/library';

describe('library data', () => {
  it('has the content-map counts and bilingual text', () => {
    expect(MYTHS.length).toBe(17); expect(FACTS.length).toBe(12); expect(CASES.length).toBe(12); expect(DIY.length).toBe(19);
    for (const x of [...MYTHS.map((m) => [m.claim, m.why]).flat(), ...FACTS.map((f) => f.text), ...CASES.flatMap((c) => [c.title, c.lesson]), ...DIY.flatMap((d) => [d.title, d.note]), ...GLOSSARY.flatMap((g) => [g.term, g.def])]) expect(x.en && x.pt).toBeTruthy();
    for (const l of [MYTHS, FACTS, CASES, DIY]) expect(new Set(l.map((x) => x.id)).size).toBe(l.length);
  });
  it('phrasebook covers all 7 languages with transliteration for non-Latin scripts', () => {
    expect(PHRASES.length).toBeGreaterThanOrEqual(24);
    for (const p of PHRASES) { for (const l of ['en', 'pt', 'es', 'fr', 'ar', 'hi', 'zh']) expect(p.text[l], `${p.id}/${l}`).toBeTruthy(); for (const l of ['ar', 'hi', 'zh'] as const) expect(p.translit[l], `${p.id}/${l}`).toBeTruthy(); }
  });
  it('DIY level and risk stay inside the allowed range', () => { for (const d of DIY) { expect([1, 2, 3]).toContain(d.level); expect(['low', 'medium']).toContain(d.risk); } });
});
describe('fact of the day', () => {
  it('is deterministic per date and cycles', () => {
    const a = new Date(2026, 10, 19); expect(factOfDay(a)).toBe(factOfDay(new Date(2026, 10, 19, 23, 59)));
    expect(dayIndex(new Date(2026, 10, 20), 12)).toBe((dayIndex(a, 12) + 1) % 12); expect(dayIndex(new Date(1969, 0, 1), 7)).toBeGreaterThanOrEqual(0);
  });
});
describe('glossary matching', () => {
  it('finds whole-word terms, not substrings', () => {
    expect(findTerms('Apply a tourniquet and treat shock.', 'en').map((g) => g.term.en)).toEqual(['tourniquet', 'shock']);
    expect(findTerms('The wind chill is high', 'en').map((g) => g.term.en)).toContain('wind chill');
    expect(findTerms('shockingly', 'en')).toEqual([]);
    expect(findTerms('Use um torniquete', 'pt').map((g) => g.term.pt)).toEqual(['torniquete']);
  });
});
describe('heat index and wind chill (NWS reference values)', () => {
  it('heat index', () => { expect(heatIndexF(90, 70)).toBeCloseTo(105.9, 0); expect(heatIndexF(96, 65)).toBeCloseTo(121, 0); expect(heatIndexF(60, 50)).toBeLessThan(62); expect(heatIndexC(32, 70)).toBeCloseTo(40.4, 0); });
  it('bands', () => { expect(heatBand(75)).toBe('none'); expect(heatBand(85)).toBe('caution'); expect(heatBand(95)).toBe('extcaution'); expect(heatBand(110)).toBe('danger'); expect(heatBand(130)).toBe('extdanger'); });
  it('wind chill', () => { expect(windChillC(-10, 30)).toBeCloseTo(-19.5, 0); expect(windChillC(0, 20)).toBeCloseTo(-5.2, 0); expect(windChillC(15, 30)).toBe(15); expect(windChillC(-5, 2)).toBe(-5); });
});
describe('find by situation / material / symptom', () => {
  const gs = [{ title: 'Boil water', summary: 'kill germs', tags: ['water', 'thirst'], materials: ['pot', 'fire'], category: 'water' }, { title: 'Burns', summary: 'cool the skin', tags: ['burn', 'pain'], materials: ['cloth'], category: 'firstaid' }];
  it('filters by kind', () => { expect(findGuides(gs, 'pot', 'material').length).toBe(1); expect(findGuides(gs, 'pot', 'symptom').length).toBe(0); expect(findGuides(gs, 'pain', 'symptom')[0].title).toBe('Burns'); expect(findGuides(gs, 'water', 'situation').length).toBe(1); expect(findGuides(gs, ' ', 'material')).toEqual([]); });
});
