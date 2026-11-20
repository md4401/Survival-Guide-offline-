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
import { factorial } from '../src/lib/calc';
import { bmi, discount, loanPayment, compound, dateDiff, addDays, radix, convertWithRate } from '../src/lib/tools2';
import { convert } from '../src/lib/units';
describe('scientific calculator', () => {
  it('functions, constants and factorial', () => {
    expect(evaluate('sin(30)', { deg: true })).toBeCloseTo(0.5, 10); expect(evaluate('sin(90)', { deg: true })).toBe(1); expect(evaluate('cos(90)', { deg: true })).toBe(0); expect(evaluate('sin(pi/2)')).toBeCloseTo(1, 10);
    expect(evaluate('asin(1)', { deg: true })).toBeCloseTo(90, 10); expect(evaluate('tan(45)', { deg: true })).toBeCloseTo(1, 10);
    expect(evaluate('lg(1000)')).toBeCloseTo(3, 10); expect(evaluate('ln(e)')).toBeCloseTo(1, 10); expect(evaluate('5!')).toBe(120); expect(evaluate('3!+2')).toBe(8); expect(evaluate('0!')).toBe(1);
    expect(evaluate('2*e')).toBeCloseTo(5.43656, 4); expect(evaluate('sqrt(16)')).toBe(4); expect(evaluate('exp(0)')).toBe(1); expect(evaluate('abs(-3)')).toBe(3);
  });
  it('rejects invalid scientific input', () => {
    for (const bad of ['ln(0)', 'lg(-1)', 'asin(2)', '2.5!', '171!', 'sin', 'foo(1)', 'sin(1']) expect(() => evaluate(bad), bad).toThrow(CalcError);
    expect(factorial(10)).toBe(3628800);
  });
});
describe('converter helpers', () => {
  it('bmi uses WHO classes', () => { expect(bmi(70, 175)!.value).toBeCloseTo(22.86, 2); expect(bmi(70, 175)!.cls).toBe('normal'); expect(bmi(50, 175)!.cls).toBe('under'); expect(bmi(85, 175)!.cls).toBe('over'); expect(bmi(110, 175)!.cls).toBe('obese'); expect(bmi(0, 175)).toBeNull(); });
  it('discount, loan and compound interest', () => {
    expect(discount(200, 25)).toEqual({ final: 150, saved: 50 }); expect(discount(100, 120)).toBeNull();
    expect(loanPayment(10000, 12, 12)!.monthly).toBeCloseTo(888.49, 2); expect(loanPayment(1200, 0, 12)!.monthly).toBe(100); expect(loanPayment(0, 5, 12)).toBeNull();
    expect(compound(1000, 10, 1, 1)!.final).toBeCloseTo(1100, 6); expect(compound(1000, 12, 1, 12)!.final).toBeCloseTo(1126.83, 2);
  });
  it('dates', () => {
    expect(dateDiff('2026-01-01', '2026-03-01')).toEqual({ days: 59, years: 0, months: 2, rest: 0 }); expect(dateDiff('2024-02-29', '2026-03-01')!.years).toBe(2); expect(dateDiff('2026-03-01', '2026-01-01')!.days).toBe(-59); expect(dateDiff('x', '2026-01-01')).toBeNull(); expect(dateDiff('2026-02-30', '2026-03-01')).toBeNull();
    expect(addDays('2026-02-27', 3)).toBe('2026-03-02'); expect(addDays('2026-01-01', -1)).toBe('2025-12-31');
  });
  it('number bases and manual-rate currency', () => {
    expect(radix('255', 10)).toEqual({ bin: '11111111', oct: '377', dec: '255', hex: 'FF' }); expect(radix('ff', 16)!.dec).toBe('255'); expect(radix('102', 2)).toBeNull(); expect(radix('', 10)).toBeNull(); expect(radix('9'.repeat(40), 10)!.hex.length).toBeGreaterThan(20);
    expect(convertWithRate(10, 5.2)).toBeCloseTo(52, 10); expect(convertWithRate(10, 0)).toBeNull();
  });
  it('new unit categories', () => { expect(convert('time', 'h', 'min', 2)).toBe(120); expect(convert('time', 'week', 'day', 1)).toBe(7); expect(convert('data', 'GiB', 'MiB', 1)).toBe(1024); expect(convert('data', 'GB', 'MB', 2)).toBe(2000); });
});
import { needleAngle, soundLevel, levelColor, Series } from '../src/lib/audioLevel';
import { tilt, bubble, isLevel, ZERO } from '../src/lib/level';
import { smooth, angleDelta, ticks, normDeg } from '../src/lib/dial';
import { coordParts } from '../src/lib/coords';
describe('sound dial and series', () => {
  it('needle angle spans 140 degrees from 20 to 120 dB', () => { expect(needleAngle(20)).toBe(-70); expect(needleAngle(70)).toBe(0); expect(needleAngle(120)).toBe(70); expect(needleAngle(0)).toBe(-70); expect(needleAngle(200)).toBe(70); });
  it('levels and colours', () => { expect(soundLevel(65)).toBe(60); expect(soundLevel(10)).toBe(20); expect(soundLevel(125)).toBe(120); expect(levelColor(30)).not.toBe(levelColor(95)); });
  it('keeps only the last 30 seconds', () => { const s = new Series(30000); for (let t = 0; t <= 60000; t += 1000) s.add(t, t / 1000); expect(s.pts[0].t).toBe(30000); expect(s.pts.length).toBe(31); s.reset(); expect(s.pts.length).toBe(0); });
});
describe('bubble level', () => {
  it('tilt with calibration, bubble position and level state', () => {
    expect(tilt(3, -2, { x: -2, y: 3 })).toEqual({ x: 0, y: 0 }); expect(tilt(3, -2)).toEqual({ x: -2, y: 3 });
    expect(bubble(10, -10, 20)).toEqual({ x: 0.5, y: -0.5 }); expect(bubble(100, -100)).toEqual({ x: 1, y: -1 }); expect(isLevel(0.4, -0.5)).toBe(true); expect(isLevel(0.6, 0)).toBe(false); expect(ZERO).toEqual({ x: 0, y: 0 });
  });
});
describe('compass dial', () => {
  it('smooths across north without spinning the long way', () => { expect(angleDelta(350, 10)).toBe(20); expect(angleDelta(10, 350)).toBe(-20); expect(smooth(null, 370)).toBe(10); expect(smooth(350, 10, 0.5)).toBe(0); expect(normDeg(-10)).toBe(350); });
  it('ring has 180 ticks, 36 long and 12 labelled', () => { const t = ticks(); expect(t.length).toBe(180); expect(t.filter((x) => x.long).length).toBe(36); expect(t.filter((x) => x.label).length).toBe(12); });
  it('splits coordinates into degrees, minutes, seconds and hemisphere', () => { expect(coordParts(-22.52, -45.6992)).toEqual({ lat: { text: "22°31'12\"", hem: 'S' }, lon: { text: "45°41'57\"", hem: 'W' } }); expect(coordParts(10.9999999, 0).lat.text).toBe("11°00'00\""); expect(coordParts(0, 10).lon.hem).toBe('E'); });
});
import { monthGrid, weekDays, eventBox, sameDate, firstDay } from '../src/lib/agenda';
describe('calendar views', () => {
  it('month grid has 42 days starting on the chosen weekday', () => {
    const g = monthGrid(2026, 10, 0); expect(g.length).toBe(42); expect(g[0].getDay()).toBe(0); expect(sameDate(g[0], new Date(2026, 10, 1))).toBe(true); expect(g.some((d) => sameDate(d, new Date(2026, 10, 30)))).toBe(true);
    expect(monthGrid(2026, 10, 1)[0].getDay()).toBe(1); expect(sameDate(monthGrid(2026, 10, 1)[0], new Date(2026, 9, 26))).toBe(true);
  });
  it('week days and weekday start', () => { const w = weekDays(new Date(2026, 10, 19), 0); expect(w.map((d) => d.getDate())).toEqual([15, 16, 17, 18, 19, 20, 21]); expect(weekDays(new Date(2026, 10, 19), 1)[0].getDate()).toBe(16); expect([0, 1]).toContain(firstDay('pt-BR')); });
  it('event boxes inside a day column', () => {
    const day = new Date(2026, 10, 19); const at = new Date(2026, 10, 19, 14, 0).getTime();
    expect(eventBox({ at, dur: 30 }, day)).toEqual({ top: 840, height: 30 }); expect(eventBox({ at }, day)).toEqual({ top: 840, height: 60 }); expect(eventBox({ at, dur: 5 }, day)!.height).toBe(20);
    expect(eventBox({ at }, new Date(2026, 10, 20))).toBeNull(); const late = new Date(2026, 10, 19, 23, 30).getTime(); expect(eventBox({ at: late, dur: 120 }, day)).toEqual({ top: 1410, height: 30 }); expect(eventBox({ at: late, dur: 120 }, new Date(2026, 10, 20))).toEqual({ top: 0, height: 90 });
  });
});
import { isTask, toggleTask, toggleTaskLine, lineAt, countChars, titleOf, History } from '../src/lib/notes';
describe('notes helpers', () => {
  it('checklists are plain text lines', () => {
    expect(isTask('[ ] milk')).toBe(true); expect(isTask('[x] milk')).toBe(true); expect(isTask('milk')).toBe(false);
    expect(toggleTask('a\n[ ] b\n[x] c', 1)).toBe('a\n[x] b\n[x] c'); expect(toggleTask('a\n[ ] b\n[x] c', 2)).toBe('a\n[ ] b\n[ ] c'); expect(toggleTask('a\n[ ] b', 0)).toBe('a\n[ ] b');
    expect(toggleTaskLine('a\nb', 1)).toBe('a\n[ ] b'); expect(toggleTaskLine('a\n[ ] b', 1)).toBe('a\nb'); expect(lineAt('ab\ncd\nef', 4)).toBe(1);
  });
  it('title, character count and history', () => {
    expect(titleOf({ text: '\n[ ] Buy water\nmore' })).toBe('Buy water'); expect(titleOf({ title: 'Plan', text: 'x' })).toBe('Plan'); expect(titleOf({ text: '' })).toBe(''); expect(countChars('a b\nc')).toBe(3);
    const h = new History('a'); h.push('ab'); h.push('abc'); expect(h.undo()).toBe('ab'); expect(h.undo()).toBe('a'); expect(h.undo()).toBeNull(); expect(h.redo()).toBe('ab'); h.push('x'); expect(h.canRedo).toBe(false); expect(h.canUndo).toBe(true);
  });
});
import { encode as gEnc, decode as gDec, channelsFor, isGeohash } from '../src/lib/geohash';
describe('geohash', () => {
  it('matches the reference example', () => { expect(gEnc(57.64911, 10.40744, 11)).toBe('u4pruydqqvj'); const d = gDec('ezs42'); expect(d.lat).toBeCloseTo(42.605, 2); expect(d.lon).toBeCloseTo(-5.603, 2); });
  it('levels nest as prefixes', () => { const c = channelsFor(-20.7, -45.8); expect(c.map((x) => x.hash.length)).toEqual([7, 6, 5, 4, 2]); expect(c[0].hash.startsWith(c[4].hash)).toBe(true); expect(isGeohash('6gzxbh6')).toBe(true); expect(isGeohash('6gzxa')).toBe(false); });
});
import { makeGeoEvent, verifyEvent, randomSecret, channelKey, pubkeyOf, geoOf, nickOf } from '../src/lib/nostr';
import { RelayPool } from '../src/lib/relay';
describe('location channels (nostr)', () => {
  it('signs and verifies events, rejects tampering', () => {
    const sk = channelKey(randomSecret(), '6gzxbh'); const e = makeGeoEvent(sk, '6gzxbh', 'hello', 'ana'); expect(verifyEvent(e)).toBe(true); expect(geoOf(e)).toBe('6gzxbh'); expect(nickOf(e)).toBe('ana'); expect(e.pubkey).toBe(pubkeyOf(sk));
    expect(verifyEvent({ ...e, content: 'bye' })).toBe(false);
  });
  it('keys differ per channel', () => { const s = randomSecret(); expect(channelKey(s, 'a')).not.toBe(channelKey(s, 'b')); });
  it('pool only passes valid events of subscribed channels, once', () => {
    const got: string[] = []; const socks: any[] = [];
    const pool = new RelayPool(['wss://x'], (e) => got.push(e.content), () => {}, () => { const s: any = { readyState: 1, sent: [] as string[], send(m: string) { this.sent.push(m); }, close() {} }; socks.push(s); return s; });
    pool.connect(); pool.subscribe('6gzx'); expect(socks[0].sent[0]).toContain('"#g":["6gzx"]');
    const sk = randomSecret(); const ok = makeGeoEvent(sk, '6gzx', 'hi', ''); const other = makeGeoEvent(sk, 'u4pr', 'no', ''); const bad = { ...ok, content: 'x' };
    for (const e of [ok, ok, other, bad]) pool.handle(JSON.stringify(['EVENT', 'g-6gzx', e])); pool.handle('garbage');
    expect(got).toEqual(['hi']);
  });
});
