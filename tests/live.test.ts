import { describe, it, expect } from 'vitest';
import { webcrypto } from 'node:crypto';
import { validManifest, decide, downloadBundle, sha256Hex, shouldCheck, CHECK_EVERY_MS, Stopped, type LiveManifest } from '../src/lib/liveUpdate';
import { onQuietScreen } from '../src/pwa';

const enc = (s: string) => new TextEncoder().encode(s);
async function bundle(files: Record<string, string>, extra: Partial<LiveManifest> = {}): Promise<LiveManifest> {
  return { version: 'abc123', minApk: 0, built: 1, files: await Promise.all(Object.entries(files).map(async ([path, c]) => ({ path, size: enc(c).length, sha256: await sha256Hex(enc(c)) }))), ...extra };
}
const server = (files: Record<string, string>): typeof fetch => (async (url: string) => { const p = String(url).split('/files/')[1]; return p in files ? { ok: true, status: 200, arrayBuffer: async () => enc(files[p]).buffer } : { ok: false, status: 404 }; }) as unknown as typeof fetch;
if (!('crypto' in globalThis)) (globalThis as any).crypto = webcrypto;

describe('live update manifest', () => {
  it('accepts a well-formed manifest and rejects unsafe or incomplete ones', async () => {
    const ok = await bundle({ 'index.html': '<html>', 'assets/a.js': 'x' }); expect(validManifest(ok)).toBe(true);
    expect(validManifest({ ...ok, files: ok.files.filter((f) => f.path !== 'index.html') })).toBe(false);
    for (const bad of ['../evil.js', '/abs.js', 'a//b.js', 'a\\b.js', 'a b.js']) expect(validManifest({ ...ok, files: [...ok.files, { path: bad, size: 1, sha256: 'a'.repeat(64) }] }), bad).toBe(false);
    expect(validManifest({ ...ok, files: [...ok.files, ok.files[0]] })).toBe(false);
    expect(validManifest({ ...ok, files: [{ ...ok.files[0], sha256: 'xyz' }] })).toBe(false);
    expect(validManifest(null)).toBe(false); expect(validManifest({ ...ok, version: 'bad version!' })).toBe(false);
  });
  it('decides what to do', async () => {
    const m = await bundle({ 'index.html': '<html>' }, { version: 'new', minApk: 30 });
    expect(decide('old', 40, m)).toBe('update'); expect(decide('new', 40, m)).toBe('same'); expect(decide('old', 20, m)).toBe('needs-apk'); expect(decide('old', 40, m, 'new')).toBe('bad'); expect(decide('old', 40, { nope: 1 })).toBe('invalid');
  });
  it('limits how often it checks', () => { expect(shouldCheck(0, CHECK_EVERY_MS - 1)).toBe(false); expect(shouldCheck(0, CHECK_EVERY_MS)).toBe(true); expect(shouldCheck(0, 1, true)).toBe(true); });
});
describe('bundle download', () => {
  it('writes every verified file and reports progress', async () => {
    const files = { 'index.html': '<html>', 'assets/a.js': 'console.log(1)' }; const m = await bundle(files); const wrote: string[] = []; let last = 0;
    await downloadBundle(m, { fetchFn: server(files), write: async (p) => { wrote.push(p); }, onProgress: (d, t) => { last = d / t; } });
    expect(wrote.sort()).toEqual(['assets/a.js', 'index.html']); expect(last).toBe(1);
  });
  it('refuses a corrupt, missing or wrongly sized file', async () => {
    const files = { 'index.html': '<html>', 'a.js': 'one' }; const m = await bundle(files);
    await expect(downloadBundle(m, { fetchFn: server({ ...files, 'a.js': 'two' }), write: async () => {} })).rejects.toThrow(/wrong size|checksum/);
    await expect(downloadBundle(m, { fetchFn: server({ ...files, 'a.js': 'ONE' }), write: async () => {} })).rejects.toThrow(/checksum/);
    await expect(downloadBundle(m, { fetchFn: server({ 'index.html': '<html>' }), write: async () => {} })).rejects.toThrow(/404/);
  });
  it('can be stopped', async () => { const files = { 'index.html': 'x' }; await expect(downloadBundle(await bundle(files), { fetchFn: server(files), write: async () => {}, shouldStop: () => true })).rejects.toBeInstanceOf(Stopped); });
});
describe('web app updates', () => {
  it('never reloads on emergency screens', () => { expect(onQuietScreen('#/emergency')).toBe(true); expect(onQuietScreen('#/triage/water.diy-filter')).toBe(true); expect(onQuietScreen('#/guides')).toBe(false); expect(onQuietScreen('#/')).toBe(false); });
});
