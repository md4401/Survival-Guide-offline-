import { KIND_GEO, verifyEvent, geoOf, type NEvent } from './nostr';
type Sock = Pick<WebSocket, 'send' | 'close' | 'readyState'> & { onopen: any; onmessage: any; onclose: any; onerror: any };
/** Talks to several public relays at once. Only validated events for the subscribed geohash are passed on. */
export class RelayPool {
  private socks = new Map<string, Sock>(); private seen = new Set<string>(); private subs = new Map<string, string>();
  constructor(private relays: string[], private onEvent: (e: NEvent) => void, private onStatus: (open: number) => void, private make: (u: string) => Sock = (u) => new WebSocket(u) as unknown as Sock) {}
  private count() { this.onStatus([...this.socks.values()].filter((s) => s.readyState === 1).length); }
  connect() {
    for (const u of this.relays) {
      if (this.socks.has(u)) continue; let s: Sock; try { s = this.make(u); } catch { continue; } this.socks.set(u, s);
      s.onopen = () => { this.count(); for (const [id, g] of this.subs) this.req(s, id, g); };
      s.onclose = s.onerror = () => { this.count(); };
      s.onmessage = (m: { data: string }) => this.handle(m.data);
    }
  }
  handle(raw: string) {
    let a: unknown; try { a = JSON.parse(raw); } catch { return; }
    if (!Array.isArray(a) || a[0] !== 'EVENT') return; const e = a[2] as NEvent;
    if (!e || e.kind !== KIND_GEO || this.seen.has(e.id) || !verifyEvent(e)) return;
    const g = geoOf(e); if (![...this.subs.values()].includes(g)) return;
    this.seen.add(e.id); if (this.seen.size > 5000) this.seen.clear(); this.onEvent(e);
  }
  private req(s: Sock, id: string, g: string) { if (s.readyState === 1) s.send(JSON.stringify(['REQ', id, { kinds: [KIND_GEO], '#g': [g], since: Math.floor(Date.now() / 1000) - 3600, limit: 100 }])); }
  subscribe(g: string) { const id = `g-${g}`; this.subs.set(id, g); for (const s of this.socks.values()) this.req(s, id, g); }
  unsubscribe(g: string) { const id = `g-${g}`; this.subs.delete(id); for (const s of this.socks.values()) if (s.readyState === 1) s.send(JSON.stringify(['CLOSE', id])); }
  publish(e: NEvent) { const m = JSON.stringify(['EVENT', e]); for (const s of this.socks.values()) if (s.readyState === 1) s.send(m); }
  close() { for (const s of this.socks.values()) try { s.close(); } catch { /* already closed */ } this.socks.clear(); this.count(); }
}
