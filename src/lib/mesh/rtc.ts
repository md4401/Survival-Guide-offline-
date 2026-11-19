// Live link between two nearby devices over WebRTC, with NO internet and NO server: pairing is done by exchanging two short codes (QR or text).
// Both devices must be on the same network (a phone hotspot, a router, Wi-Fi Direct): only local "host" ICE candidates are used (no STUN/TURN).
import { packText, unpackText } from './bundle';
import { Session, type Frame, type MeshNode } from './sync';

const P = { raw: 'SGMR0.', zip: 'SGMR1.' };
const CFG: RTCConfiguration = { iceServers: [] };
export const rtcSupported = () => typeof RTCPeerConnection !== 'undefined';

function gathered(pc: RTCPeerConnection, ms = 5000): Promise<void> {
  return new Promise((res) => {
    if (pc.iceGatheringState === 'complete') return res();
    const done = () => { pc.removeEventListener('icegatheringstatechange', on); clearTimeout(t); res(); };
    const on = () => { if (pc.iceGatheringState === 'complete') done(); };
    const t = setTimeout(done, ms); pc.addEventListener('icegatheringstatechange', on);
  });
}
const pack = (d: RTCSessionDescription | null) => packText({ type: d!.type, sdp: d!.sdp }, P);

/** Host: creates the offer code to show to the other device. */
export async function createOffer(): Promise<{ pc: RTCPeerConnection; dc: RTCDataChannel; code: string }> {
  const pc = new RTCPeerConnection(CFG); const dc = pc.createDataChannel('mesh', { ordered: true });
  await pc.setLocalDescription(await pc.createOffer()); await gathered(pc);
  return { pc, dc, code: await pack(pc.localDescription) };
}
/** Guest: takes the host's code and returns the answer code to show back. The data channel arrives through `opened`. */
export async function acceptOffer(code: string): Promise<{ pc: RTCPeerConnection; answer: string; opened: Promise<RTCDataChannel> }> {
  const offer: any = await unpackText(code, P); if (offer?.type !== 'offer' || typeof offer.sdp !== 'string') throw new Error('bad-offer');
  const pc = new RTCPeerConnection(CFG);
  const opened = new Promise<RTCDataChannel>((res) => { pc.ondatachannel = (e) => res(e.channel); });
  await pc.setRemoteDescription(offer); await pc.setLocalDescription(await pc.createAnswer()); await gathered(pc);
  return { pc, answer: await pack(pc.localDescription), opened };
}
export async function applyAnswer(pc: RTCPeerConnection, code: string) {
  const a: any = await unpackText(code, P); if (a?.type !== 'answer' || typeof a.sdp !== 'string') throw new Error('bad-answer');
  await pc.setRemoteDescription(a);
}

/** Runs the gossip protocol over an open (or opening) data channel. Returns a closer. */
export function attachSession(node: MeshNode, me: { pub: string; name: string }, dc: RTCDataChannel, onState: (s: 'open' | 'closed', peer?: { pub: string; name: string } | null) => void): () => void {
  const session = new Session(node, (f: Frame) => { if (dc.readyState === 'open') dc.send(JSON.stringify(f)); }, me);
  const open = () => { onState('open', null); void session.start(); };
  if (dc.readyState === 'open') open(); else dc.addEventListener('open', open);
  dc.addEventListener('message', async (e) => {
    if (typeof e.data !== 'string' || e.data.length > 200_000) return;
    try { await session.onFrame(JSON.parse(e.data)); onState('open', session.peer); } catch { /* ignore malformed frames */ }
  });
  const close = () => { session.close(); onState('closed'); };
  dc.addEventListener('close', close);
  return () => { try { dc.close(); } catch { /* already closed */ } close(); };
}
