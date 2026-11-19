import { describe, it, expect } from 'vitest';
import { evaluate, fmt, CalcError } from '../src/lib/calc';
import { rms, toDb, bandOf, Stats } from '../src/lib/audioLevel';
import { magnitude, Baseline, strength, beepEvery } from '../src/lib/magnetometer';
import { nextOccurrence, onDay, upcoming, past, type AgendaEvent } from '../src/lib/agenda';

describe('calculator', () => {
  it('precedence, parentheses, unary minus, power, percent, roots', () => {
    expect(evaluate('2+3×4')).toBe(14); expect(evaluate('(2+3)*4')).toBe(20); expect(evaluate('-2^2')).toBe(-4); expect(evaluate('2^3^2')).toBe(512);
    expect(evaluate('50%')).toBe(0.5); expect(evaluate('200*10%')).toBe(20); expect(evaluate('√16+1')).toBe(5); expect(evaluate('10÷4')).toBe(2.5); expect(evaluate('1,5+1.5')).toBe(3);
    expect(evaluate('π')).toBeCloseTo(3.14159, 4); expect(evaluate('--3')).toBe(3);
  });
  it('rejects bad input without throwing anything else', () => {
    for (const bad of ['', '2+', '(2', '2)', '1/0', '√-1', '1..2', 'abc', 'alert(1)', '*3']) expect(() => evaluate(bad), bad).toThrow(CalcError);
    expect(() => evaluate('9^9^9')).toThrow(CalcError);
  });
  it('formats without floating noise', () => { expect(fmt(0.1 + 0.2)).toBe('0.3'); expect(fmt(1 / 3)).toBe('0.333333333333'.slice(0, 12)); expect(fmt(1e20)).toContain('e+'); expect(fmt(14)).toBe('14'); });
});
describe('sound level', () => {
  it('rms and dB', () => { expect(rms([])).toBe(0); expect(rms([1, -1, 1, -1])).toBe(1); expect(toDb(1, 90)).toBe(90); expect(toDb(0.1, 90)).toBeCloseTo(70, 5); expect(toDb(0)).toBe(0); expect(toDb(1e-9, 90)).toBe(0); expect(toDb(100, 90)).toBe(130); expect(toDb(1e9, 90)).toBe(140); });
  it('bands and stats', () => { expect([30, 50, 80, 95].map(bandOf)).toEqual(['quiet', 'moderate', 'loud', 'veryloud']); const s = new Stats(); [50, 70, 60].forEach((v) => s.add(v)); expect([s.min, s.max, s.avg]).toEqual([50, 70, 60]); s.reset(); expect(s.n).toBe(0); });
});
describe('metal detector maths', () => {
  it('magnitude, baseline, strength, beeps', () => {
    expect(magnitude(3, 4, 0)).toBe(5); const b = new Baseline(3); [40, 42, 44, 99].forEach((v) => b.add(v)); expect(b.ready).toBe(true); expect(b.value).toBe(42);
    expect(strength(42, 42)).toBe(0); expect(strength(62, 42)).toBe(0.5); expect(strength(500, 42)).toBe(1); expect(beepEvery(0.01)).toBeNull(); expect(beepEvery(1)).toBe(100); expect(beepEvery(0.5)!).toBeLessThan(beepEvery(0.1)!);
  });
});
describe('agenda', () => {
  const D = (y: number, m: number, d: number, h = 9) => new Date(y, m - 1, d, h, 0).getTime();
  const ev = (at: number, repeat: AgendaEvent['repeat'] = 'none', title = 'x'): AgendaEvent => ({ title, at, note: '', repeat });
  it('next occurrence for single, daily, weekly and yearly events', () => {
    expect(nextOccurrence(ev(D(2026, 11, 20)), D(2026, 11, 19))).toBe(D(2026, 11, 20)); expect(nextOccurrence(ev(D(2026, 11, 1)), D(2026, 11, 19))).toBeNull();
    expect(nextOccurrence(ev(D(2026, 11, 1), 'daily'), D(2026, 11, 19, 10))).toBe(D(2026, 11, 20)); expect(nextOccurrence(ev(D(2026, 11, 1), 'daily'), D(2026, 11, 19, 8))).toBe(D(2026, 11, 19));
    expect(nextOccurrence(ev(D(2026, 11, 2), 'weekly'), D(2026, 11, 19))).toBe(D(2026, 11, 23)); expect(nextOccurrence(ev(D(2020, 3, 5), 'yearly'), D(2026, 11, 19))).toBe(D(2027, 3, 5)); expect(nextOccurrence(ev(D(2020, 12, 5), 'yearly'), D(2026, 11, 19))).toBe(D(2026, 12, 5));
  });
  it('events on a day, upcoming and past', () => {
    const es = [ev(D(2026, 11, 19, 15), 'none', 'a'), ev(D(2026, 11, 19, 8), 'none', 'b'), ev(D(2026, 11, 1), 'daily', 'c'), ev(D(2026, 11, 2), 'none', 'old')];
    expect(onDay(es, new Date(2026, 10, 19)).map((e) => e.title)).toEqual(['b', 'c', 'a']);
    expect(upcoming(es, D(2026, 11, 19, 12), 2).map((e) => e.title)).toEqual(['a', 'c']); expect(past(es, D(2026, 11, 19, 7)).map((e) => e.title)).toEqual(['old']);
  });
});
