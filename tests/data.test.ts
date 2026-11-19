import { describe, it, expect } from 'vitest';
import emergency from '../src/generated/emergency.json';
import countries from '../src/generated/countries.json';

const E = emergency as Record<string, { numbers: Record<string, string>; source: string }>;
describe('generated data', () => {
  it('250 countries, most with population and time zones', () => {
    expect(countries).toHaveLength(250);
    expect((countries as any[]).filter((c) => c.population != null).length).toBeGreaterThan(230);
    expect((countries as any[]).find((c) => c.cca2 === 'BR').timezones.length).toBeGreaterThan(3);
  });
  it('spec emergency numbers override community data (incl. Australia 000)', () => {
    expect(E.AU.numbers.general).toBe('000'); expect(E.AU.source).toBe('spec');
    expect(E.BR.numbers).toMatchObject({ police: '190', ambulance: '192', fire: '193', civil: '199', mental: '188' });
    expect(E.GB.numbers.general).toBe('999'); expect(E.US.numbers.general).toBe('911');
  });
  it('every stored number is 2-7 digits (no lost leading zeros / junk)', () => {
    for (const [c, e] of Object.entries(E)) for (const n of Object.values(e.numbers)) expect(n, c).toMatch(/^\d{2,7}$/);
  });
});
