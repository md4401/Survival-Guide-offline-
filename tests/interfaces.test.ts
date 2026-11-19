import 'fake-indexeddb/auto';
import { describe, it, expect } from 'vitest';
import { ed25519 } from '@noble/curves/ed25519.js';
import { verifyToken, licenseStatus } from '../src/interfaces/license';
import { createPackUpdater, sha256Hex } from '../src/interfaces/packUpdate';
import { db } from '../src/db/dexie';

const b64u = (b: Uint8Array) => btoa(String.fromCharCode(...b)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const hex = (b: Uint8Array) => [...b].map((x) => x.toString(16).padStart(2, '0')).join('');
const priv = ed25519.utils.randomSecretKey(); const pub = hex(ed25519.getPublicKey(priv));
const mk = (o: object, key = priv) => { const p = new TextEncoder().encode(JSON.stringify(o)); return `${b64u(p)}.${b64u(ed25519.sign(p, key))}`; };
const claims = { sub: 'dev-1', plan: 'premium', issued: 1000, expires: 1000 + 365 * 86400, grace_days: 30, devices: 1 };

describe('license (offline Ed25519)', () => {
  it('accepts a valid token', async () => expect((await verifyToken(mk(claims), pub))?.sub).toBe('dev-1'));
  it('rejects tampering, wrong key, malformed and unconfigured key', async () => {
    const [p, s] = mk(claims).split('.');
    const forged = b64u(new TextEncoder().encode(JSON.stringify({ ...claims, expires: 9e9 })));
    expect(await verifyToken(`${forged}.${s}`, pub)).toBeNull();
    expect(await verifyToken(mk(claims, ed25519.utils.randomSecretKey()), pub)).toBeNull();
    expect(await verifyToken('garbage', pub)).toBeNull(); expect(await verifyToken(`${p}.${s}`, null)).toBeNull();
  });
  it('active → grace (30 d) → expired', async () => {
    const l = (await verifyToken(mk(claims), pub))!;
    expect(licenseStatus(l, 2000)).toBe('active');
    expect(licenseStatus(l, l.expires + 10 * 86400)).toBe('grace');
    expect(licenseStatus(l, l.expires + 31 * 86400)).toBe('expired');
  });
});

describe('pack updater', () => {
  const body = JSON.stringify({ lang: 'pt', version: '2099-01-01', guides: [] });
  const bytes = new TextEncoder().encode(body);
  const mkFetch = (sha: string) => (async (u: string) => {
    if (u.endsWith('manifest.json')) return new Response(JSON.stringify({ packs: { 'core.pt': { lang: 'pt', version: '2099-01-01', bytes: bytes.length, sha256: sha, url: 'http://x/core.pt.json' } } }));
    return new Response(bytes);
  }) as typeof fetch;
  it('installs a pack whose checksum matches', async () => {
    await db.packs.clear();
    const u = createPackUpdater({ baseUrl: 'http://x', fetchFn: mkFetch(await sha256Hex(bytes.buffer as ArrayBuffer)) });
    expect((await u.checkForUpdates()).map((p) => p.id)).toEqual(['core.pt']);
    expect(await u.install('core.pt')).toBe(true);
    expect((await u.list())[0].version).toBe('2099-01-01'); expect(await u.checkForUpdates()).toEqual([]);
  });
  it('keeps the old pack when the checksum fails', async () => {
    await db.packs.clear();
    const u = createPackUpdater({ baseUrl: 'http://x', fetchFn: mkFetch('0'.repeat(64)) });
    expect(await u.install('core.pt')).toBe(false); expect(await db.packs.count()).toBe(0);
  });
  it('never runs during a crisis or offline', async () => {
    const f = mkFetch('x');
    expect(await createPackUpdater({ baseUrl: 'x', fetchFn: f, isCrisis: async () => true }).install('core.pt')).toBe(false);
    expect(await createPackUpdater({ baseUrl: 'x', fetchFn: f, online: () => false }).checkForUpdates()).toEqual([]);
  });
});
