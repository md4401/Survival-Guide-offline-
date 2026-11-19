import { describe, it, expect } from 'vitest';
import { convert } from '../src/lib/units';
import { plan, quantity, progress, checkKey, KITS } from '../src/data/kits';
import { canAccess } from '../src/content/access';
import { FLAGS } from '../src/flags';
import { licenseService } from '../src/interfaces/license';

describe('unit converter', () => {
  it('temperature', () => {
    expect(convert('temperature', 'C', 'F', 0)).toBeCloseTo(32); expect(convert('temperature', 'C', 'F', 100)).toBeCloseTo(212);
    expect(convert('temperature', 'F', 'C', -40)).toBeCloseTo(-40); expect(convert('temperature', 'K', 'C', 273.15)).toBeCloseTo(0);
  });
  it('length, mass, volume, speed, pressure', () => {
    expect(convert('length', 'mi', 'km', 1)).toBeCloseTo(1.609344); expect(convert('length', 'ft', 'm', 10)).toBeCloseTo(3.048);
    expect(convert('mass', 'kg', 'lb', 1)).toBeCloseTo(2.20462, 4); expect(convert('volume', 'gal', 'L', 1)).toBeCloseTo(3.7854, 3);
    expect(convert('speed', 'km/h', 'mph', 100)).toBeCloseTo(62.137, 2); expect(convert('pressure', 'hPa', 'inHg', 1013.25)).toBeCloseTo(29.92, 2);
  });
  it('round-trips', () => expect(convert('length', 'km', 'mi', convert('length', 'mi', 'km', 7))).toBeCloseTo(7));
});

describe('kit calculator', () => {
  const water = KITS['72h'].find((i) => i.id === 'water')!;
  it('scales with people and days', () => {
    expect(quantity(water, { people: 1, days: 1 })).toBe(water.perPersonDay);
    expect(quantity(water, { people: 4, days: 3 })).toBe(water.perPersonDay! * 12);
    expect(quantity(water, { people: 2, days: 7 })).toBe(quantity(water, { people: 1, days: 7 }) * 2);
  });
  it('fixed items do not scale; per-person items scale with people only', () => {
    const fa = KITS['72h'].find((i) => i.id === 'firstaid')!, fl = KITS['72h'].find((i) => i.id === 'flashlight')!;
    expect(quantity(fa, { people: 6, days: 9 })).toBe(1); expect(quantity(fl, { people: 6, days: 9 })).toBe(6);
  });
  it('conditional items follow the profile', () => {
    const ids = (n: any) => plan('72h', n).map((x) => x.item.id);
    expect(ids({ people: 2, days: 3 })).not.toContain('kidsupplies');
    expect(ids({ people: 2, days: 3, kids: 1 })).toContain('kidsupplies');
    expect(ids({ people: 2, days: 3, pets: 1 })).toContain('petsupplies');
  });
  it('checklist progress', () => {
    const n = { people: 1, days: 3 }; const all = plan('72h', n);
    expect(progress('72h', n, new Set())).toBe(0);
    expect(progress('72h', n, new Set(all.map((x) => checkKey('72h', x.item.id))))).toBe(100);
  });
});

describe('plans and interfaces', () => {
  it('vital content is never blocked, even for premium plan and no license', () => {
    expect(canAccess({ vital: true, plan: 'premium' }, null)).toBe(true);
    expect(canAccess({ vital: true, plan: 'free' }, null)).toBe(true);
  });
  it('premium is off in the MVP', async () => {
    expect(FLAGS.premium).toBe(false);
    expect(canAccess({ vital: false, plan: 'premium' }, null)).toBe(false);
    expect(await licenseService.current()).toBeNull();
  });
});
