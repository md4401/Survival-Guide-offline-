import 'fake-indexeddb/auto';
import { describe, it, expect } from 'vitest';
import { spell, PHONETIC } from '../src/data/phonetic';
import { headingToCardinal, headingFromEvent, normDeg } from '../src/lib/compass';
import { bandFor, BANDS, ZONES } from '../src/data/climateZones';
import { exportBackup, importBackup, BackupError } from '../src/lib/backup';
import { addReport, listReports, removeReport, flushReports, reportsText } from '../src/lib/reports';
import { db, setKV, getKV } from '../src/db/dexie';

describe('phonetic alphabet', () => {
  it('has 26 letters + 10 digits and spells text', () => {
    expect(Object.keys(PHONETIC)).toHaveLength(36);
    expect(spell('SOS')).toEqual(['Sierra', 'Oscar', 'Sierra']);
    expect(spell('Ação 7')).toEqual(['Alfa', 'Charlie', 'Alfa', 'Oscar', '/', 'Seven']);
    expect(spell('!!!')).toEqual([]);
  });
});
describe('compass', () => {
  it('maps headings to 8 sectors', () => {
    expect([0, 22, 23, 90, 180, 270, 315, 359, 360, -45].map(headingToCardinal)).toEqual(['N', 'N', 'NE', 'E', 'S', 'W', 'NW', 'N', 'N', 'NW']);
    expect(normDeg(-90)).toBe(270);
  });
  it('derives heading from sensor events', () => {
    expect(headingFromEvent({ alpha: 90, absolute: true })).toBe(270); // device rotated 90° CCW → facing west
    expect(headingFromEvent({ alpha: 10, webkitCompassHeading: 123 })).toBe(123);
    expect(headingFromEvent({ alpha: null })).toBeNull(); expect(headingFromEvent({ alpha: 10, absolute: false })).toBeNull();
  });
});
describe('climate bands/zones', () => {
  it('bands by latitude, symmetric in both hemispheres', () => {
    expect([0, 23, 24, 34, 40, 60, 66, 67, 90].map(bandFor)).toEqual(['tropical', 'tropical', 'subtropical', 'subtropical', 'temperate', 'subpolar', 'subpolar', 'polar', 'polar']);
    expect(bandFor(-30)).toBe(bandFor(30)); expect(BANDS).toHaveLength(5); expect(ZONES).toHaveLength(12);
  });
});
describe('encrypted backup', () => {
  it('round-trips user data and excludes AI state', async () => {
    await db.favorites.put({ id: 'water.diy-filter', at: 1 }); await db.notes.add({ text: 'meu abrigo', at: 2 });
    await setKV('settings', { locale: 'pt' }); await setKV('ai', { installed: { x: 1 } });
    const file = await exportBackup('segredo');
    expect(file).not.toContain('meu abrigo'); expect(file).not.toContain('water.diy-filter');
    await db.favorites.clear(); await db.notes.clear(); await setKV('settings', { locale: 'en' });
    await importBackup(file, 'segredo');
    expect((await db.favorites.toArray())[0].id).toBe('water.diy-filter');
    expect((await db.notes.toArray())[0].text).toBe('meu abrigo');
    expect(await getKV('settings', null)).toEqual({ locale: 'pt' });
  });
  it('rejects a wrong passphrase, tampering and non-backup files; data stays intact', async () => {
    const file = await exportBackup('abc');
    await expect(importBackup(file, 'xyz')).rejects.toMatchObject({ code: 'bad-password' });
    const j = JSON.parse(file); j.data = j.data.slice(0, -4) + 'AAAA';
    await expect(importBackup(JSON.stringify(j), 'abc')).rejects.toBeInstanceOf(BackupError);
    await expect(importBackup('not json', 'abc')).rejects.toMatchObject({ code: 'corrupt' });
    await expect(importBackup('{"app":"other"}', 'abc')).rejects.toMatchObject({ code: 'corrupt' });
    expect(await db.favorites.count()).toBeGreaterThan(0);
  });
});
describe('offline error reports', () => {
  it('queues, lists and removes reports on the device', async () => {
    const r = await addReport({ guideId: 'water.diy-filter', lang: 'pt', text: '  passo 3 confuso ' });
    expect(r.text).toBe('passo 3 confuso'); expect((await listReports())[0].sent).toBe(false);
    expect(reportsText(await listReports())).toContain('water.diy-filter (pt): passo 3 confuso');
    await removeReport(r.id); expect(await listReports()).toEqual([]);
  });
  it('never sends without endpoint, consent or connection; sends and marks when allowed', async () => {
    await addReport({ guideId: 'a', lang: 'en', text: 'x' });
    let calls = 0; const f = (async () => { calls++; return new Response('ok'); }) as typeof fetch;
    expect(await flushReports({ endpoint: null, consent: true, online: true, fetchFn: f })).toBe(0);
    expect(await flushReports({ endpoint: 'http://x', consent: false, online: true, fetchFn: f })).toBe(0);
    expect(await flushReports({ endpoint: 'http://x', consent: true, online: false, fetchFn: f })).toBe(0);
    expect(calls).toBe(0);
    expect(await flushReports({ endpoint: 'http://x', consent: true, online: true, fetchFn: f })).toBe(1);
    expect((await listReports())[0].sent).toBe(true);
    const bad = (async () => { throw new Error('net'); }) as typeof fetch; await addReport({ guideId: 'b', lang: 'en', text: 'y' });
    expect(await flushReports({ endpoint: 'http://x', consent: true, online: true, fetchFn: bad })).toBe(0);
    expect((await listReports()).some((r) => !r.sent)).toBe(true);
  });
});
