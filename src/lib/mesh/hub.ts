// One MeshNode per app run, an event bus so screens refresh when messages arrive, and the live link (kept here so it survives navigation).
import { MeshNode } from './sync';
import { dbStore, ensureIdentity } from './store';
import { acceptOffer, applyAnswer, attachSession, createOffer } from './rtc';
import { limit } from '../../data/plans';
import type { Msg } from './protocol';

const subs = new Set<(m?: Msg) => void>();
export const onMeshChange = (f: (m?: Msg) => void) => { subs.add(f); return () => { subs.delete(f); }; };
export const notifyMesh = (m?: Msg) => subs.forEach((f) => f(m));
let node: MeshNode | null = null;
export function getNode(): MeshNode { return (node ??= new MeshNode(dbStore, Date.now, (m) => notifyMesh(m))); }

export type Phase = 'idle' | 'host' | 'guest' | 'connected' | 'failed';
export const link: { phase: Phase; code: string; peer: string } = { phase: 'idle', code: '', peer: '' };
const lsubs = new Set<() => void>();
export const onLink = (f: () => void) => { lsubs.add(f); return () => { lsubs.delete(f); }; };
const setLink = (p: Partial<typeof link>) => { Object.assign(link, p); lsubs.forEach((f) => f()); };
let pc: RTCPeerConnection | null = null; let closer: (() => void) | null = null;

async function wire(dc: RTCDataChannel) {
  const me = await ensureIdentity('');
  if (getNode().sessions.size >= limit('livePeers')) { setLink({ phase: 'failed' }); return; }
  closer = attachSession(getNode(), { pub: me.pub, name: me.name }, dc, (st, p) => {
    if (st === 'open') setLink({ phase: 'connected', peer: p?.name ?? link.peer }); else setLink({ phase: 'idle', code: '', peer: '' });
    notifyMesh();
  });
}
export async function startHost() { hangup(); setLink({ phase: 'host' }); try { const o = await createOffer(); pc = o.pc; setLink({ code: o.code }); await wire(o.dc); } catch { setLink({ phase: 'failed' }); } }
export async function submitAnswer(code: string) { try { await applyAnswer(pc!, code.trim()); } catch { setLink({ phase: 'failed' }); } }
export function startGuest() { hangup(); setLink({ phase: 'guest' }); }
export async function submitOffer(code: string) { try { const a = await acceptOffer(code.trim()); pc = a.pc; setLink({ code: a.answer }); await wire(await a.opened); } catch { setLink({ phase: 'failed' }); } }
export function hangup() { closer?.(); try { pc?.close(); } catch { /* ignore */ } pc = null; closer = null; setLink({ phase: 'idle', code: '', peer: '' }); }
