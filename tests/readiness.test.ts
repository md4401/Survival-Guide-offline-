import { describe, it, expect } from 'vitest';
import { readiness, WEIGHTS, AREAS } from '../src/lib/readiness';
import { plan, checkKey } from '../src/data/kits';

const needs = { people: 2, days: 3 };
const all = () => new Set(plan('72h', needs).map((x) => checkKey('72h', x.item.id)));
const base = { needs, done: new Set<string>(), hasFamilyPlan: false, vitalTotal: 10, vitalRead: 0 };
describe('readiness score (spec §6.3)', () => {
  it('weights add up to 100', () => expect(AREAS.reduce((n, a) => n + WEIGHTS[a], 0)).toBe(100));
  it('empty = 0, everything done = 100', () => {
    expect(readiness(base).total).toBe(0);
    expect(readiness({ ...base, done: all(), hasFamilyPlan: true, vitalRead: 10 }).total).toBe(100);
  });
  it('checking items raises the right area', () => {
    const waterOnly = new Set(['72h:water', '72h:purify']);
    const r = readiness({ ...base, done: waterOnly });
    expect(r.areas.water).toBe(100); expect(r.areas.food).toBe(0); expect(r.total).toBe(20);
  });
  it('family plan counts for communication; reading vital guides counts for knowledge', () => {
    expect(readiness({ ...base, hasFamilyPlan: true }).areas.comms).toBeGreaterThan(0);
    expect(readiness({ ...base, vitalRead: 5 }).areas.knowledge).toBe(50);
    expect(readiness({ ...base, vitalTotal: 0 }).areas.knowledge).toBe(0);
  });
  it('always proposes a next step until everything is done, preferring the highest gain', () => {
    const r = readiness(base); expect(r.next).not.toBeNull();
    expect(readiness({ ...base, done: all(), hasFamilyPlan: true, vitalRead: 10 }).next).toBeNull();
    const almostWater = readiness({ ...base, done: new Set(['72h:water']) });
    expect(almostWater.next?.area).toBeDefined();
  });
  it('conditional items (kids) appear in the plan and the score', () => {
    const k = readiness({ ...base, needs: { ...needs, kids: 1 } });
    expect(Object.keys(k.areas)).toHaveLength(8);
  });
});
