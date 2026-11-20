// Bluetooth LE transport for the mesh. The native plugin only moves bytes between nearby phones;
// each linked phone is wrapped as a DataChannel-like object so the existing signed, relayed mesh (MeshNode/Session) runs on top.
import { Capacitor, registerPlugin } from '@capacitor/core';
import { attachSession } from './rtc';
import { getNode, notifyMesh } from './hub';
import { ensureIdentity } from './store';

export const CHUNK = 176; // payload bytes per BLE packet (MTU 185 minus ATT header and our 4-byte header)
const HEAD = 4;
/** Splits bytes into packets: [id u16][index u8][total u8][payload]. Null if the frame is too large (> 255 packets). */
export function chunk(data: Uint8Array, id: number, size = CHUNK): Uint8Array[] | null {
  const total = Math.max(1, Math.ceil(data.length / size)); if (total > 255) return null;
  return Array.from({ length: total }, (_, i) => { const p = data.subarray(i * size, (i + 1) * size); const out = new Uint8Array(HEAD + p.length); out[0] = (id >> 8) & 255; out[1] = id & 255; out[2] = i; out[3] = total; out.set(p, HEAD); return out; });
}
/** Reassembles packets (in any order) into whole frames. Keeps only a few unfinished frames per peer. */
export class Reassembler {
  private parts = new Map<number, { total: number; got: Map<number, Uint8Array>; size: number }>();
  add(pkt: Uint8Array, maxBytes = 200_000): Uint8Array | null {
    if (pkt.length < HEAD) return null;
    const id = (pkt[0] << 8) | pkt[1], idx = pkt[2], total = pkt[3]; if (total === 0 || idx >= total) return null;
    let p = this.parts.get(id); if (!p || p.total !== total) { p = { total, got: new Map(), size: 0 }; this.parts.set(id, p); if (this.parts.size > 8) this.parts.delete(this.parts.keys().next().value as number); }
    if (!p.got.has(idx)) { const body = pkt.subarray(HEAD); p.size += body.length; if (p.size > maxBytes) { this.parts.delete(id); return null; } p.got.set(idx, body); }
    if (p.got.size < total) return null;
    const out = new Uint8Array(p.size); let o = 0; for (let i = 0; i < total; i++) { const b = p.got.get(i)!; out.set(b, o); o += b.length; }
    this.parts.delete(id); return out;
  }
}
const b64 = (b: Uint8Array) => { let s = ''; for (const x of b) s += String.fromCharCode(x); return btoa(s); };
const unb64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

/** One BLE link seen as a DataChannel: string frames in, string frames out. */
export class BleChannel extends EventTarget {
  readyState: 'open' | 'closed' = 'open'; private re = new Reassembler(); private n = Math.floor(Math.random() * 65536);
  constructor(private out: (pkt: Uint8Array) => void) { super(); }
  send(s: string) { if (this.readyState !== 'open') return; const parts = chunk(new TextEncoder().encode(s), (this.n = (this.n + 1) & 0xffff)); if (parts) for (const p of parts) this.out(p); }
  deliver(pkt: Uint8Array) { const f = this.re.add(pkt); if (f) this.dispatchEvent(Object.assign(new Event('message'), { data: new TextDecoder().decode(f) })); }
  close() { if (this.readyState === 'closed') return; this.readyState = 'closed'; this.dispatchEvent(new Event('close')); }
}

interface NativeBle {
  isAvailable(): Promise<{ available: boolean; enabled: boolean }>; start(): Promise<void>; stop(): Promise<void>; send(o: { id: string; data: string }): Promise<void>;
  addListener(ev: 'peer', cb: (d: { id: string; connected: boolean }) => void): Promise<{ remove(): Promise<void> }>;
  addListener(ev: 'data', cb: (d: { id: string; data: string }) => void): Promise<{ remove(): Promise<void> }>;
}
const Native = registerPlugin<NativeBle>('Ble');
export const bleSupported = async (): Promise<boolean> => { if (!Capacitor.isNativePlatform()) return false; try { return (await Native.isAvailable()).available; } catch { return false; } };
export type BleError = 'denied' | 'off' | 'unavailable';

/** Starts advertising and scanning. Returns a stop function. `onPeers` gets the number of linked phones. */
export async function startBle(onPeers: (n: number) => void): Promise<() => void> {
  const me = await ensureIdentity(''); const links = new Map<string, { ch: BleChannel; stop: () => void }>();
  const h1 = await Native.addListener('peer', (d) => {
    if (d.connected && !links.has(d.id)) {
      const ch = new BleChannel((p) => { void Native.send({ id: d.id, data: b64(p) }).catch(() => {}); });
      const stop = attachSession(getNode(), { pub: me.pub, name: me.name }, ch as unknown as RTCDataChannel, () => { onPeers(links.size); notifyMesh(); });
      links.set(d.id, { ch, stop }); onPeers(links.size);
    } else if (!d.connected) { const l = links.get(d.id); if (l) { links.delete(d.id); l.stop(); onPeers(links.size); } }
  });
  const h2 = await Native.addListener('data', (d) => { try { links.get(d.id)?.ch.deliver(unb64(d.data)); } catch { /* ignore bad packet */ } });
  try { await Native.start(); } catch (e) { await h1.remove(); await h2.remove(); throw new Error(String((e as { message?: string })?.message ?? 'unavailable')); }
  return () => { void Native.stop().catch(() => {}); void h1.remove(); void h2.remove(); for (const l of links.values()) l.stop(); links.clear(); onPeers(0); };
}
