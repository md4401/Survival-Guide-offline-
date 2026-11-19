// Offline transport by text/QR: a "bundle" is a compressed list of signed messages that can travel by QR, copy/paste, SMS, radio, NFC, AirDrop…
import { b64u, unb64u } from './crypto';
import type { Msg } from './protocol';

async function pipe(data: Uint8Array, kind: 'compress' | 'decompress'): Promise<Uint8Array> {
  const S: any = kind === 'compress' ? (globalThis as any).CompressionStream : (globalThis as any).DecompressionStream;
  if (!S) throw new Error('no-compression');
  const stream = new Blob([data as BlobPart]).stream().pipeThrough(new S('deflate-raw'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}
const PREFIX = { raw: 'SGMB0.', zip: 'SGMB1.' };
export async function packText(obj: unknown, prefix = PREFIX): Promise<string> {
  const bytes = new TextEncoder().encode(JSON.stringify(obj));
  try { return prefix.zip + b64u(await pipe(bytes, 'compress')); } catch { return prefix.raw + b64u(bytes); }
}
export async function unpackText(text: string, prefix = PREFIX): Promise<unknown> {
  const t = text.trim();
  if (t.startsWith(prefix.zip)) return JSON.parse(new TextDecoder().decode(await pipe(unb64u(t.slice(prefix.zip.length)), 'decompress')));
  if (t.startsWith(prefix.raw)) return JSON.parse(new TextDecoder().decode(unb64u(t.slice(prefix.raw.length))));
  throw new Error('not-a-bundle');
}
export const encodeBundle = (msgs: Msg[]) => packText({ app: 'sg', msgs });
export async function decodeBundle(text: string): Promise<unknown[]> {
  const j: any = await unpackText(text); if (!j || !Array.isArray(j.msgs)) throw new Error('not-a-bundle'); return j.msgs;
}

/** Splits a long text into QR-sized frames: "SGMF1:<id>:<i>/<n>:<chunk>". */
export function toFrames(text: string, size = 700): string[] {
  const id = b64u(crypto.getRandomValues(new Uint8Array(4))); const n = Math.max(1, Math.ceil(text.length / size));
  return Array.from({ length: n }, (_, i) => `SGMF1:${id}:${i + 1}/${n}:${text.slice(i * size, (i + 1) * size)}`);
}
/** Collects frames in any order (duplicates ignored) until the text is complete. */
export class FrameAssembler {
  private id = ''; private total = 0; private parts = new Map<number, string>();
  add(frame: string): { done: boolean; have: number; total: number; text?: string } {
    const m = /^SGMF1:([\w-]+):(\d+)\/(\d+):([\s\S]*)$/.exec(frame.trim());
    if (m) {
      const [, id, i, n, data] = m; const idx = +i, tot = +n;
      if (tot < 1 || tot > 500 || idx < 1 || idx > tot) return { done: false, have: this.parts.size, total: this.total };
      if (id !== this.id || tot !== this.total) { this.id = id; this.total = tot; this.parts.clear(); }
      this.parts.set(idx, data);
    }
    const done = this.total > 0 && this.parts.size === this.total;
    return { done, have: this.parts.size, total: this.total, text: done ? Array.from({ length: this.total }, (_, k) => this.parts.get(k + 1)).join('') : undefined };
  }
}
