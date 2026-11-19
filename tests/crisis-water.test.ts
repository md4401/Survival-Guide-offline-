import { describe, it, expect } from 'vitest';
import { stageFor, batteryHoursLeft, summarize, SCENARIOS, SCENARIO_GUIDE } from '../src/lib/crisis';
import { waterNeed, chlorineDose } from '../src/lib/water';
import { suggest } from '../src/lib/suggest';

describe('crisis mode', () => {
  it('timeline stages', () => {
    const m = 60e3;
    expect([5 * m, 30 * m, 5 * 3600e3, 30 * 3600e3, 5 * 86400e3, 40 * 86400e3].map(stageFor)).toEqual(['10min', '1h', '24h', '72h', '7d', '30d']);
    expect(stageFor(0)).toBe('10min'); expect(stageFor(72 * 3600e3)).toBe('7d');
  });
  it('battery estimate from discharge rate', () => {
    const h = 3600e3;
    expect(batteryHoursLeft([{ t: 0, level: 0.8 }, { t: 2 * h, level: 0.6 }])).toBeCloseTo(6, 5); // 10%/h, 60% left
    expect(batteryHoursLeft([{ t: 0, level: 0.5 }])).toBeNull();
    expect(batteryHoursLeft([{ t: 0, level: 0.5 }, { t: h, level: 0.6 }])).toBeNull(); // charging
  });
  it('summary', () => {
    const c = { scenario: 'blackout' as const, start: 0, diary: [{ at: 1, text: 'a' }], prevBattery: false };
    expect(summarize(c, 2 * 86400e3 + 5 * 3600e3)).toEqual({ days: 2, hours: 5, entries: 1 });
  });
  it('all 8 MVP scenarios map to guide ids', () => { expect(SCENARIOS).toHaveLength(8); for (const s of SCENARIOS) expect(SCENARIO_GUIDE[s]).toMatch(/^scenario\./); });
});
describe('water calculators', () => {
  it('need scales with people, days, heat, effort, kids and pets', () => {
    const base = { people: 2, kids: 0, pets: 0, days: 1, hot: false, hardWork: false };
    expect(waterNeed(base)).toBe(6);
    expect(waterNeed({ ...base, days: 3 })).toBe(18);
    expect(waterNeed({ ...base, hot: true })).toBeGreaterThan(6);
    expect(waterNeed({ ...base, kids: 1 })).toBeLessThan(6);
    expect(waterNeed({ ...base, pets: 1 })).toBe(7);
  });
  it('chlorine dose follows concentration and volume (1 % ≈ 10 000 mg/L)', () => {
    const d = chlorineDose(10, 5, 5)!; // 5 mg/L × 10 L / 50 000 mg/L = 1 mL
    expect(d.mL).toBeCloseTo(1, 6); expect(d.drops).toBe(20); expect(d.waitMin).toBe(30);
    expect(chlorineDose(20, 5, 5)!.mL).toBeCloseTo(2, 6);
    expect(chlorineDose(10, 10, 5)!.mL).toBeCloseTo(0.5, 6);
  });
  it('rejects invalid input', () => { expect(chlorineDose(0, 5)).toBeNull(); expect(chlorineDose(5, 0)).toBeNull(); expect(chlorineDose(-1, 5)).toBeNull(); });
});
describe('suggestions', () => {
  it('seasonal and profile rules each carry a reason', () => {
    const s = suggest({ season: 'summer', home: 'apartment', kids: 0, elderly: 0, pets: 0 });
    expect(s.map((x) => x.scenario)).toEqual(['heatwave', 'fire', 'blackout']);
    expect(s.every((x) => x.reason.startsWith('why.'))).toBe(true);
    expect(suggest({ season: 'winter', home: 'house', kids: 0, elderly: 0, pets: 0 })[0].scenario).toBe('coldwave');
  });
});
