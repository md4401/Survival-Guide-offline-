import 'fake-indexeddb/auto';
import { describe, it, expect } from 'vitest';
import { stockReport, totalKcal, byKcalDesc } from '../src/lib/stock';
import { dailyWh, energyReport, mahToWh } from '../src/lib/energy';
import { daysLeft, expiryStatus, sortByExpiry, dueSoon, isDue, markDone, nextDue, notifyAt, parseDay, DEFAULT_REMINDERS } from '../src/lib/inventory';
import { seal, open, VaultError, EMPTY_VAULT } from '../src/lib/vault';

describe('food stock', () => {
  const items = [{ name: 'rice', qty: 5, kcalPerUnit: 3600 }, { name: 'beans', qty: 2, kcalPerUnit: 1500 }];
  it('adds up kcal and reports days, deficit and enough', () => {
    expect(totalKcal(items)).toBe(21000);
    const r = stockReport(items, 2, 3); expect(r.daily).toBe(4000); expect(r.days).toBeCloseTo(5.25); expect(r.enough).toBe(true); expect(r.deficit).toBe(0);
    const s = stockReport(items, 4, 4); expect(s.enough).toBe(false); expect(s.deficit).toBe(32000 - 21000);
  });
  it('ignores negative values and orders by kcal', () => {
    expect(totalKcal([{ name: 'x', qty: -2, kcalPerUnit: 100 }])).toBe(0); expect(byKcalDesc(items)[0].name).toBe('rice'); expect(stockReport([], 0, 1).daily).toBe(2000);
  });
});
describe('energy budget', () => {
  it('daily Wh, autonomy and shares', () => {
    const ds = [{ name: 'phone', watts: 5, hours: 3 }, { name: 'radio', watts: 2, hours: 4 }];
    expect(dailyWh(ds)).toBe(23); const r = energyReport(ds, mahToWh(20000)); expect(mahToWh(20000)).toBeCloseTo(74);
    expect(r.usable).toBeCloseTo(62.9); expect(r.days).toBeCloseTo(62.9 / 23, 3); expect(r.shares[0].pct).toBeCloseTo(15 / 23);
    expect(energyReport([], 50).days).toBe(Infinity);
  });
});
describe('inventory expiry and reminders', () => {
  const now = Date.UTC(2026, 10, 19, 12);
  it('days left and status thresholds', () => {
    expect(daysLeft('2026-11-19', now)).toBe(0); expect(daysLeft('2026-11-18', now)).toBe(-1); expect(daysLeft('2026-12-19', now)).toBe(30); expect(daysLeft('bad', now)).toBeNull();
    expect(['2026-11-01', '2026-12-10', '2027-06-01', ''].map((d) => expiryStatus(d, now))).toEqual(['expired', 'soon', 'ok', 'none']);
  });
  it('sorts nearest first (no date last) and lists what is due', () => {
    const xs = [{ expires: '2027-01-01' }, { expires: '' }, { expires: '2026-11-25' }, { expires: '2026-01-01' }];
    expect(sortByExpiry(xs).map((x) => x.expires)).toEqual(['2026-01-01', '2026-11-25', '2027-01-01', '']); expect(dueSoon(xs, now).length).toBe(2);
  });
  it('recurring reminders become due after their interval and reset when done', () => {
    const r = { ...DEFAULT_REMINDERS[0], last: now - 200 * 86400000 }; expect(isDue(r, now)).toBe(true);
    const [done] = markDone([r], 'kit', now); expect(isDue(done, now)).toBe(false); expect(nextDue(done)).toBe(now + 182 * 86400000);
  });
  it('native notification time: 09:00 local, N days before, none if past', () => {
    const at = notifyAt('2026-12-20', 3, now)!; expect([at.getFullYear(), at.getMonth(), at.getDate(), at.getHours()]).toEqual([2026, 11, 17, 9]);
    expect(notifyAt('2026-11-01', 0, now)).toBeNull(); expect(Number.isNaN(parseDay('2026-1-1'))).toBe(true);
  });
});
describe('vault', () => {
  it('round-trips, hides content, rejects a wrong password and tampering', async () => {
    const data = { ...EMPTY_VAULT, docs: [{ id: '1', title: 'Passport', text: 'AB123456' }] };
    const s = await seal('correct horse', data); expect(JSON.stringify(s)).not.toContain('AB123456');
    expect((await open<typeof data>('correct horse', s)).docs[0].text).toBe('AB123456');
    await expect(open('wrong', s)).rejects.toMatchObject({ code: 'bad-password' });
    await expect(open('correct horse', { ...s, data: s.data.slice(0, -4) + 'AAAA' })).rejects.toBeInstanceOf(VaultError);
    await expect(open('x', {} as any)).rejects.toMatchObject({ code: 'corrupt' });
  });
});
