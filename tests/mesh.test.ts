import 'fake-indexeddb/auto';
import { describe, it, expect } from 'vitest';
import { newIdentity, deriveChannel, encryptText, decryptText, randomPassphrase, fingerprint, b64u, unb64u } from '../src/lib/mesh/crypto';
import { createMessage, verifyMessage, readText, LIMITS, PUBLIC, canonical } from '../src/lib/mesh/protocol';
import { MeshNode, Session, batches, type StoreLike, type Frame } from '../src/lib/mesh/sync';
import { encodeBundle, decodeBundle, toFrames, FrameAssembler, packText, unpackText } from '../src/lib/mesh/bundle';
import { addChannel, dbStore, ensureIdentity, keyMap, loadChannels } from '../src/lib/mesh/store';
import { db } from '../src/db/dexie';
import type { Msg } from '../src/lib/mesh/protocol';

const NOW = 1_800_000_000_000;
const mem = (): StoreLike & { m: Map<string, Msg> } => { const m = new Map<string, Msg>(); return { m, has: async (i) => m.has(i), put: async (x) => { m.set(x.id, x); }, ids: async () => [...m.keys()], all: async () => [...m.values()] }; };
const alice = newIdentity('Alice'), bob = newIdentity('Bob'), carol = newIdentity('Carol');
// fast key derivation in tests
const key = (p: string) => deriveChannel(p, 1000);

describe('crypto', () => {
  it('identities are distinct with readable fingerprints', () => {
    expect(alice.pub).not.toBe(bob.pub); expect(fingerprint(alice.pub)).toMatch(/^([0-9a-f]{4}-){3}[0-9a-f]{4}$/);
  });
  it('channel key: same passphrase → same id; different → different; AES-GCM binds aad and key', async () => {
    const a = await key('K7QM-2WXD'), a2 = await key('  K7QM-2WXD '), b = await key('other');
    expect(a.id).toBe(a2.id); expect(a.id).not.toBe(b.id); expect(a.id).toMatch(/^c[0-9a-f]{15}$/);
    const e = await encryptText(a.raw, 'olá', 'ch|me');
    expect(await decryptText(a.raw, e.iv, e.ct, 'ch|me')).toBe('olá');
    expect(await decryptText(b.raw, e.iv, e.ct, 'ch|me')).toBeNull(); expect(await decryptText(a.raw, e.iv, e.ct, 'ch|other')).toBeNull();
  });
  it('random passphrases look like XXXX-XXXX-XXXX-XXXX and differ', () => { const p = randomPassphrase(); expect(p).toMatch(/^([A-Z2-9]{4}-){3}[A-Z2-9]{4}$/); expect(p).not.toBe(randomPassphrase()); });
  it('base64url round-trips', () => { const b = crypto.getRandomValues(new Uint8Array(1000)); expect(unb64u(b64u(b))).toEqual(b); });
});

describe('messages', () => {
  it('public message verifies; tampering with any signed field is rejected', async () => {
    const m = await createMessage(alice, { id: PUBLIC }, 'hello', 'text', NOW);
    expect((await verifyMessage(m, NOW)).ok).toBe(true);
    for (const t of [{ body: 'hellO' }, { ts: m.ts + 1 }, { name: 'Mallory' }, { kind: 'sos' as const }, { from: bob.pub }]) {
      const r = await verifyMessage({ ...m, ...t }, NOW); expect(r.ok, JSON.stringify(t)).toBe(false);
    }
    expect((await verifyMessage({ ...m, hops: 3 }, NOW)).ok).toBe(true); // hops are not signed: relays change them
  });
  it('forged id / signature / bad shape / time window / size are rejected with a reason', async () => {
    const m = await createMessage(alice, { id: PUBLIC }, 'x', 'text', NOW);
    expect(await verifyMessage({ ...m, id: 'a'.repeat(24) }, NOW)).toEqual({ ok: false, reason: 'id' });
    expect(await verifyMessage({ ...m, sig: '0'.repeat(128) }, NOW)).toEqual({ ok: false, reason: 'signature' });
    expect(await verifyMessage({ ...m, v: 2 }, NOW)).toEqual({ ok: false, reason: 'format' });
    expect(await verifyMessage(null, NOW)).toEqual({ ok: false, reason: 'format' });
    expect(await verifyMessage({ ...m, hops: 99 }, NOW)).toEqual({ ok: false, reason: 'format' });
    expect(await verifyMessage(m, NOW + LIMITS.maxAgeMs + 1)).toEqual({ ok: false, reason: 'time' });
    expect(await verifyMessage(m, NOW - LIMITS.maxFutureMs - 1)).toEqual({ ok: false, reason: 'time' });
    expect((await verifyMessage({ ...m, name: 'x'.repeat(40) }, NOW)).ok).toBe(false);
  });
  it('private message: ciphertext on the wire, readable only with the channel key, authenticity kept', async () => {
    const k = await key('family-pass'); const wrong = await key('nope');
    const m = await createMessage(alice, { id: k.id, key: k }, 'estamos bem', 'text', NOW);
    expect(m.enc).toBe(1); expect(m.body).not.toContain('estamos'); expect((await verifyMessage(m, NOW)).ok).toBe(true);
    expect(await readText(m, new Map([[k.id, k]]))).toBe('estamos bem');
    expect(await readText(m, new Map([[k.id, wrong]]))).toBeNull(); expect(await readText(m, new Map())).toBeNull();
    await expect(createMessage(alice, { id: k.id }, 'x', 'text', NOW)).rejects.toThrow();
    expect((await verifyMessage({ ...m, enc: 0 }, NOW)).ok).toBe(false); // private id must be encrypted
  });
  it('bodies are capped and canonical bytes ignore hops', async () => {
    const m = await createMessage(alice, { id: PUBLIC }, 'a'.repeat(5000), 'sos', NOW);
    expect(m.body.length).toBe(LIMITS.maxBody); expect(canonical(m)).toEqual(canonical({ ...m, hops: 5 } as any));
  });
});

describe('gossip sync', () => {
  const wire = (a: MeshNode, b: MeshNode) => {
    const q: Array<() => Promise<void>> = [];
    let sa!: Session, sb!: Session;
    sa = new Session(a, (f: Frame) => q.push(() => sb.onFrame(JSON.parse(JSON.stringify(f)))), { pub: alice.pub, name: 'A' });
    sb = new Session(b, (f: Frame) => q.push(() => sa.onFrame(JSON.parse(JSON.stringify(f)))), { pub: bob.pub, name: 'B' });
    const flush = async () => { while (q.length) await q.shift()!(); };
    const run = async () => { await sa.start(); await sb.start(); await flush(); };
    return { sa, sb, run, flush };
  };
  it('two devices end up with the union of their messages, no duplicates, hop counts incremented', async () => {
    const A = new MeshNode(mem(), () => NOW), B = new MeshNode(mem(), () => NOW);
    const m1 = await createMessage(alice, { id: PUBLIC }, 'one', 'text', NOW), m2 = await createMessage(alice, { id: PUBLIC }, 'two', 'text', NOW + 1);
    const m3 = await createMessage(bob, { id: PUBLIC }, 'three', 'sos', NOW + 2);
    await A.publish(m1); await A.publish(m2); await B.publish(m3);
    await wire(A, B).run();
    expect((await A.store.ids()).sort()).toEqual([m1.id, m2.id, m3.id].sort()); expect((await B.store.ids()).sort()).toEqual([m1.id, m2.id, m3.id].sort());
    expect((await B.store.all()).find((x) => x.id === m1.id)!.hops).toBe(1);
    expect(A.stats.rejected + B.stats.rejected).toBe(0);
  });
  it('a tampered message from a peer is rejected and never stored or relayed', async () => {
    const A = new MeshNode(mem(), () => NOW), B = new MeshNode(mem(), () => NOW);
    const m = await createMessage(alice, { id: PUBLIC }, 'real', 'text', NOW);
    expect(await B.receive({ ...m, body: 'fake' })).toBe(false); expect(B.stats.rejected).toBe(1); expect((await B.store.ids()).length).toBe(0);
    expect(await B.receive(m)).toBe(true); expect(await B.receive(m)).toBe(false); expect(B.stats.duplicates).toBe(1);
    void A;
  });
  it('relays across a chain A–B–C (store-and-forward), and stops at the hop limit', async () => {
    const A = new MeshNode(mem(), () => NOW), B = new MeshNode(mem(), () => NOW), C = new MeshNode(mem(), () => NOW);
    const ab = wire(A, B); await ab.run();   // A–B connected first, nothing to exchange yet
    const m = await createMessage(alice, { id: PUBLIC }, 'hello C', 'text', NOW);
    await A.publish(m); await ab.flush();     // B now carries A's message
    await wire(B, C).run();   // later B meets C and carries A's message
    expect((await C.store.all())[0].body).toBe('hello C'); expect((await C.store.all())[0].hops).toBe(2);
    const far = { ...m, hops: LIMITS.maxHops }; const D = new MeshNode(mem(), () => NOW), E = new MeshNode(mem(), () => NOW);
    await D.store.put(far); await wire(D, E).run(); expect((await E.store.ids()).length).toBe(0);
  });
  it('live messages are pushed to every connected peer except the sender', async () => {
    const A = new MeshNode(mem(), () => NOW), B = new MeshNode(mem(), () => NOW), C = new MeshNode(mem(), () => NOW);
    const ab = wire(A, B), bc = wire(B, C); await ab.run(); await bc.run();
    await A.publish(await createMessage(alice, { id: PUBLIC }, 'live', 'text', NOW));
    await ab.flush(); await bc.flush(); // A→B, then B relays to C
    expect((await C.store.ids()).length).toBe(1);
  });
  it('batches stay under the byte and count limits', async () => {
    const list: Msg[] = []; for (let i = 0; i < 150; i++) list.push(await createMessage(carol, { id: PUBLIC }, 'm'.repeat(200) + i, 'text', NOW + i));
    const b = batches(list); expect(b.flat().length).toBe(150);
    for (const x of b) { expect(x.length).toBeLessThanOrEqual(LIMITS.maxPerFrame); expect(JSON.stringify(x).length).toBeLessThan(13000); }
  });
});

describe('bundles and QR frames', () => {
  it('bundle round-trips (compressed) and is smaller than raw JSON for many messages', async () => {
    const msgs: Msg[] = []; for (let i = 0; i < 20; i++) msgs.push(await createMessage(alice, { id: PUBLIC }, 'status update number ' + i, 'text', NOW + i));
    const t = await encodeBundle(msgs); expect(t.startsWith('SGMB1.')).toBe(true); expect(t.length).toBeLessThan(JSON.stringify(msgs).length);
    const back = await decodeBundle(t); expect(back).toEqual(msgs);
    for (const m of back) expect((await verifyMessage(m, NOW + 100)).ok).toBe(true);
  });
  it('rejects things that are not bundles', async () => { await expect(decodeBundle('hello')).rejects.toThrow(); await expect(unpackText('SGMB1.@@@')).rejects.toBeDefined(); });
  it('frames reassemble in any order with duplicates, and a new bundle resets the assembler', () => {
    const text = 'SGMB1.' + 'abcdefghij'.repeat(300); const fr = toFrames(text, 500); expect(fr.length).toBe(Math.ceil(text.length / 500));
    const a = new FrameAssembler(); let r: any;
    for (const f of [...fr].reverse().concat(fr[0])) r = a.add(f);
    expect(r.done).toBe(true); expect(r.text).toBe(text);
    const other = toFrames('SGMB1.zzz', 500); const b = new FrameAssembler(); b.add(fr[0]); expect(b.add(other[0]).text).toBe('SGMB1.zzz');
    expect(new FrameAssembler().add('garbage')).toMatchObject({ done: false, total: 0 });
  });
  it('generic pack/unpack with another prefix', async () => { const p = { raw: 'X0.', zip: 'X1.' }; expect(await unpackText(await packText({ a: 1 }, p), p)).toEqual({ a: 1 }); });
});

describe('device storage', () => {
  it('identity persists; channels derive and are idempotent; messages list/prune', async () => {
    const a = await ensureIdentity('Zed'); expect((await ensureIdentity('Other')).pub).toBe(a.pub);
    const c = await addChannel('Família', 'pass-123'); expect((await addChannel('again', 'pass-123')).id).toBe(c.id); expect((await loadChannels()).length).toBe(1);
    const k = keyMap(await loadChannels()); expect(k.get(c.id)!.raw.length).toBe(32);
    const m1 = await createMessage(a, { id: PUBLIC }, 'old', 'text', NOW - 6 * 86400e3), m2 = await createMessage(a, { id: PUBLIC }, 'new', 'text', NOW);
    await db.meshMsgs.clear(); await dbStore.put(m1); await dbStore.put(m2);
    expect((await dbStore.list(PUBLIC)).map((m) => m.body)).toEqual(['old', 'new']);
    await dbStore.prune(NOW + 2 * 86400e3); expect((await dbStore.list(PUBLIC)).map((m) => m.body)).toEqual(['new']);
  });
});
