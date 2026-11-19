// Transport-agnostic gossip: peers exchange the ids they have and send each other what is missing; accepted messages are relayed to other peers.
import { LIMITS, verifyMessage, type Msg } from './protocol';

export type Frame = { t: 'hello'; pub: string; name: string } | { t: 'have'; ids: string[] } | { t: 'msgs'; list: Msg[] };
export interface StoreLike { has(id: string): Promise<boolean>; put(m: Msg): Promise<void>; ids(): Promise<string[]>; all(): Promise<Msg[]> }

/** Splits messages into frames whose JSON stays small enough for a WebRTC data channel (~16 KB). */
export function batches(list: Msg[], maxBytes = 12000): Msg[][] {
  const out: Msg[][] = []; let cur: Msg[] = []; let size = 0;
  for (const m of list) {
    const n = JSON.stringify(m).length;
    if (cur.length && (size + n > maxBytes || cur.length >= LIMITS.maxPerFrame)) { out.push(cur); cur = []; size = 0; }
    cur.push(m); size += n;
  }
  if (cur.length) out.push(cur); return out;
}

export class MeshNode {
  sessions = new Set<Session>();
  stats = { accepted: 0, duplicates: 0, rejected: 0 };
  constructor(public store: StoreLike, public now: () => number = Date.now, public onNew: (m: Msg) => void = () => {}) {}
  /** Stores a received message after verification; relays it to every other peer. Returns true if it was new and valid. */
  async receive(raw: unknown, from?: Session): Promise<boolean> {
    const v = await verifyMessage(raw, this.now());
    if (!v.ok) { this.stats.rejected++; return false; }
    if (await this.store.has(v.msg.id)) { this.stats.duplicates++; return false; }
    await this.store.put(v.msg); this.stats.accepted++; this.onNew(v.msg);
    for (const s of this.sessions) if (s !== from) s.push(v.msg);
    return true;
  }
  /** A message created on this device: store it and push it to all connected peers. */
  async publish(m: Msg) { if (!(await this.store.has(m.id))) await this.store.put(m); for (const s of this.sessions) s.push(m); }
}

export class Session {
  private theirs = new Set<string>();
  peer: { pub: string; name: string } | null = null;
  constructor(private node: MeshNode, private send: (f: Frame) => void, private me: { pub: string; name: string }) { node.sessions.add(this); }
  async start() { this.send({ t: 'hello', ...this.me }); this.send({ t: 'have', ids: await this.node.store.ids() }); }
  close() { this.node.sessions.delete(this); }
  /** Relay: one more hop, never beyond the limit, never back to a peer that already has it. */
  push(m: Msg) { if (m.hops + 1 <= LIMITS.maxHops && !this.theirs.has(m.id)) { this.theirs.add(m.id); this.send({ t: 'msgs', list: [{ ...m, hops: m.hops + 1 }] }); } }
  async onFrame(f: Frame) {
    if (f.t === 'hello' && typeof f.pub === 'string') this.peer = { pub: f.pub.slice(0, 64), name: String(f.name ?? '').slice(0, LIMITS.maxName) };
    else if (f.t === 'have' && Array.isArray(f.ids)) {
      for (const id of f.ids.slice(0, LIMITS.maxStored * 2)) if (typeof id === 'string') this.theirs.add(id);
      const missing = (await this.node.store.all()).filter((m) => !this.theirs.has(m.id) && m.hops + 1 <= LIMITS.maxHops).map((m) => ({ ...m, hops: m.hops + 1 }));
      for (const m of missing) this.theirs.add(m.id);
      for (const b of batches(missing)) this.send({ t: 'msgs', list: b });
    } else if (f.t === 'msgs' && Array.isArray(f.list)) {
      for (const m of f.list.slice(0, LIMITS.maxPerFrame)) { if (m && typeof m.id === 'string') this.theirs.add(m.id); await this.node.receive(m, this); }
    }
  }
}
