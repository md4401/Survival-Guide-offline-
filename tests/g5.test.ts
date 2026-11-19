import { describe, it, expect } from 'vitest';
import 'fake-indexeddb/auto';
import { parseForecast, forecastUrl, codeKey, refreshForecast, loadForecast, ageHours } from '../src/lib/forecast';
import { reviewStats } from '../src/lib/review';

const fixture = { daily: { time: ['2026-11-19', '2026-11-20'], temperature_2m_max: [28.1, 30], temperature_2m_min: [19, 20.5], precipitation_sum: [0, 12.4], weathercode: [1, 95] } };
describe('forecast', () => {
  it('url sends only rounded coordinates', () => { const u = forecastUrl(-23.5505, -46.6333); expect(u).toContain('latitude=-23.55'); expect(u).toContain('longitude=-46.63'); expect(u).not.toMatch(/name|email|id=/); });
  it('parses a fixture and rejects bad data', () => { const f = parseForecast(fixture, 1, 2, 5)!; expect(f.days.length).toBe(2); expect(f.days[1]).toEqual({ date: '2026-11-20', max: 30, min: 20.5, rain: 12.4, code: 95 }); expect(parseForecast({}, 1, 2, 5)).toBeNull(); expect(parseForecast({ daily: { time: ['x'], temperature_2m_max: ['a'], temperature_2m_min: [1] } }, 1, 2, 5)).toBeNull(); });
  it('maps WMO codes', () => { expect(['0', '2', '45', '53', '63', '73', '81', '95'].map((c) => codeKey(Number(c)))).toEqual(['clear', 'cloudy', 'fog', 'drizzle', 'rain', 'snow', 'rain', 'storm']); });
  const ok = (async () => ({ ok: true, json: async () => fixture })) as unknown as typeof fetch;
  it('never fetches without consent, offline, or in crisis', async () => {
    let calls = 0; const f = (async () => { calls++; return { ok: true, json: async () => fixture }; }) as unknown as typeof fetch;
    for (const o of [{ consent: false, online: true, crisis: false }, { consent: true, online: false, crisis: false }, { consent: true, online: true, crisis: true }]) expect(await refreshForecast({ lat: 1, lon: 2, fetchFn: f, ...o })).toBeNull();
    expect(calls).toBe(0);
  });
  it('fetches with consent, caches it, and survives a later failure', async () => {
    const f = await refreshForecast({ lat: 1, lon: 2, consent: true, online: true, crisis: false, fetchFn: ok, now: 1000 }); expect(f?.days.length).toBe(2);
    expect((await loadForecast())?.fetchedAt).toBe(1000);
    const bad = (async () => { throw new Error('offline'); }) as unknown as typeof fetch;
    expect(await refreshForecast({ lat: 1, lon: 2, consent: true, online: true, crisis: false, fetchFn: bad })).toBeNull(); expect((await loadForecast())?.fetchedAt).toBe(1000);
    expect(ageHours({ fetchedAt: 0, lat: 0, lon: 0, days: [] }, 3 * 3600000)).toBe(3);
  });
});
describe('review stats', () => {
  it('counts by status, level, kind', () => {
    const r = (level: any) => ({ date: '', level, source: '' });
    const s = reviewStats([{ status: 'published', needsReview: false, review: r('professional'), kind: 'guide', vital: true }, { status: 'draft', needsReview: true, review: r('draft'), kind: 'guide', vital: false }, { status: 'draft', needsReview: true, review: r('draft'), kind: 'scenario', vital: true }]);
    expect(s).toMatchObject({ total: 3, needsReview: 2, vitalNotReviewed: 1, byStatus: { published: 1, draft: 2 }, byLevel: { professional: 1, draft: 2 }, byKind: { guide: 2, scenario: 1 } });
  });
});
