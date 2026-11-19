import { describe, it, expect } from 'vitest';
import { sunTimes, moon, nextMoonEvent, season, julianDay } from '../src/lib/astro';
import { partsIn, dayOfYear, isoWeek, isLeap, quarter, dayNumber, elapsed, nowMs } from '../src/lib/clock';
import { easter, holidaysBR, monthGrid, formatInCalendar } from '../src/lib/calendar';

const minutes = (d: Date | null) => (d ? d.getUTCHours() * 60 + d.getUTCMinutes() : NaN);

describe('clock', () => {
  it('applies manual offset', () => expect(nowMs(5000) - Date.now()).toBeGreaterThanOrEqual(4990));
  it('reads parts in a time zone', () => {
    const t = Date.UTC(2026, 10, 19, 2, 30, 15); // 02:30:15 UTC
    expect(partsIn(t, 'UTC')).toMatchObject({ year: 2026, month: 11, day: 19, hour: 2, minute: 30, second: 15, weekday: 4 });
    expect(partsIn(t, 'America/Sao_Paulo')).toMatchObject({ day: 18, hour: 23, minute: 30 });
    expect(partsIn(t, 'Asia/Tokyo')).toMatchObject({ day: 19, hour: 11 });
  });
  it('day of year, leap years, quarters', () => {
    expect(dayOfYear(2024, 3, 1)).toBe(61); expect(dayOfYear(2025, 3, 1)).toBe(60); expect(dayOfYear(2026, 12, 31)).toBe(365);
    expect([2000, 2024, 1900, 2100, 2026].map(isLeap)).toEqual([true, true, false, false, false]);
    expect([1, 3, 4, 12].map(quarter)).toEqual([1, 1, 2, 4]);
  });
  it('ISO weeks incl. year boundaries', () => {
    expect(isoWeek(2026, 1, 1)).toEqual({ week: 1, year: 2026 });
    expect(isoWeek(2024, 12, 30)).toEqual({ week: 1, year: 2025 });
    expect(isoWeek(2021, 1, 3)).toEqual({ week: 53, year: 2020 });
  });
  it('day counter starts at Day 1 and crosses midnight by calendar day', () => {
    const start = Date.UTC(2026, 10, 12, 12);
    expect(dayNumber(start, start, 'UTC')).toBe(1);
    expect(dayNumber(start, Date.UTC(2026, 10, 18, 1), 'UTC')).toBe(7);
    expect(elapsed(start, start + (2 * 86400 + 3 * 3600 + 4 * 60) * 1000)).toEqual({ days: 2, hours: 3, minutes: 4 });
  });
});

describe('sun', () => {
  it('Julian day reference (J2000 = 2451544.5 at 0h UT on 2000-01-01)', () => expect(julianDay(2000, 1, 1)).toBeCloseTo(2451544.5, 5));
  it('London 2024-06-21 sunrise/sunset ≈ 03:43 / 20:21 UTC', () => {
    const s = sunTimes(2024, 6, 21, 51.5074, -0.1278);
    expect(Math.abs(minutes(s.sunrise) - (3 * 60 + 43))).toBeLessThanOrEqual(4);
    expect(Math.abs(minutes(s.sunset) - (20 * 60 + 21))).toBeLessThanOrEqual(4);
    expect(Math.abs(s.dayLengthMin! - (16 * 60 + 38))).toBeLessThanOrEqual(5);
  });
  it('equator near equinox has ~12h day', () => {
    const s = sunTimes(2024, 3, 20, 0, 0);
    expect(Math.abs(s.dayLengthMin! - 727)).toBeLessThanOrEqual(6); // 12h07 with refraction
  });
  it('southern summer has longer days than northern winter at same latitude', () => {
    const sp = sunTimes(2024, 12, 21, -23.55, -46.63), lon = sunTimes(2024, 12, 21, 51.5, -0.13);
    expect(sp.dayLengthMin!).toBeGreaterThan(13 * 60); expect(lon.dayLengthMin!).toBeLessThan(8.5 * 60);
  });
  it('polar day / polar night', () => {
    const d = sunTimes(2024, 6, 21, 69.65, 18.96), n = sunTimes(2024, 12, 21, 69.65, 18.96);
    expect(d.polar).toBe('day'); expect(d.sunrise).toBeNull();
    expect(n.polar).toBe('night'); expect(n.sunset).toBeNull();
  });
  it('seasons flip by hemisphere', () => {
    expect(season(new Date(Date.UTC(2024, 6, 15)), 40)).toBe('summer');
    expect(season(new Date(Date.UTC(2024, 6, 15)), -30)).toBe('winter');
    expect(season(new Date(Date.UTC(2024, 2, 21)), 40)).toBe('spring');
    expect(season(new Date(Date.UTC(2024, 11, 22)), 40)).toBe('winter');
  });
});

describe('moon', () => {
  it('new moon 2024-01-11 ~11:57 UTC', () => {
    const m = moon(new Date(Date.UTC(2024, 0, 11, 12)));
    expect(Math.min(m.age, 29.53 - m.age)).toBeLessThan(1); expect(m.illumination).toBeLessThan(0.05); expect(m.name).toBe('new');
  });
  it('full moon 2024-01-25 ~17:54 UTC', () => {
    const m = moon(new Date(Date.UTC(2024, 0, 25, 18)));
    expect(Math.abs(m.age - 14.77)).toBeLessThan(1); expect(m.illumination).toBeGreaterThan(0.95); expect(m.name).toBe('full');
  });
  it('first quarter ~7 days after new', () => expect(moon(new Date(Date.UTC(2024, 0, 18, 12))).name).toBe('firstQuarter'));
  it('next events are in the future and ~half a month apart', () => {
    const d = new Date(Date.UTC(2024, 0, 12));
    const f = nextMoonEvent(d, 0.5), n = nextMoonEvent(d, 0);
    expect(f.getTime()).toBeGreaterThan(d.getTime()); expect(n.getTime()).toBeGreaterThan(f.getTime());
    expect(Math.abs((f.getTime() - d.getTime()) / 86400000 - 13.8)).toBeLessThan(2);
  });
});

describe('calendar', () => {
  it('Easter dates', () => { expect(easter(2024)).toEqual([3, 31]); expect(easter(2025)).toEqual([4, 20]); expect(easter(2026)).toEqual([4, 5]); });
  it('Brazilian holidays include moveable ones', () => {
    const h = holidaysBR(2024).map((x) => `${x.month}-${x.day}:${x.key}`);
    expect(h).toContain('2-12:holiday.carnival'); expect(h).toContain('2-13:holiday.carnival');
    expect(h).toContain('3-29:holiday.goodfriday'); expect(h).toContain('3-31:holiday.easter'); expect(h).toContain('5-30:holiday.corpuschristi');
    expect(h).toContain('9-7:holiday.independence');
  });
  it('month grid', () => {
    const g = monthGrid(2026, 11, 0); // Nov 2026 starts Sunday
    expect(g[0][0]).toBe(1); expect(g.flat().filter(Boolean)).toHaveLength(30); expect(g.every((w) => w.length === 7)).toBe(true);
    expect(monthGrid(2026, 11, 1)[0].slice(0, 6).every((c) => c === null)).toBe(true); // Monday start: Sunday is last column
    expect(monthGrid(2024, 2, 0).flat().filter(Boolean)).toHaveLength(29);
  });
  it('alternative calendars via Intl', () => {
    expect(formatInCalendar(Date.UTC(2024, 2, 20, 12), 'persian', 'en', 'UTC')).toContain('1403');
    expect(formatInCalendar(Date.UTC(2024, 0, 1, 12), 'hebrew', 'en', 'UTC')).toMatch(/5784/);
  });
});
