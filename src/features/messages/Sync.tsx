import { useEffect, useRef, useState } from 'preact/hooks';
import { t } from '../../i18n';
import { dbStore } from '../../lib/mesh/store';
import { getNode, hangup, link, notifyMesh, onLink, startGuest, startHost, submitAnswer, submitOffer } from '../../lib/mesh/hub';
import { LIMITS } from '../../lib/mesh/protocol';
import { decodeBundle, encodeBundle, FrameAssembler } from '../../lib/mesh/bundle';
import { rtcSupported } from '../../lib/mesh/rtc';
import { MultiQr, QrScanner } from '../../components/Qr';

export function Sync() {
  const [bundle, setBundle] = useState(''); const [count, setCount] = useState(0);
  const [paste, setPaste] = useState(''); const [result, setResult] = useState(''); const [scan, setScan] = useState<null | 'bundle' | 'link'>(null);
  const [progress, setProgress] = useState(''); const asm = useRef(new FrameAssembler());

  const make = async () => {
    const msgs = (await dbStore.all()).filter((m) => m.hops < LIMITS.maxHops).sort((a, b) => b.ts - a.ts).slice(0, 300);
    setCount(msgs.length); setBundle(await encodeBundle(msgs));
  };
  const importText = async (text: string) => {
    const node = getNode(); const before = { ...node.stats };
    try {
      for (const m of await decodeBundle(text)) await node.receive(m);
      setResult(t('msg.import.result', { n: node.stats.accepted - before.accepted, d: node.stats.duplicates - before.duplicates, r: node.stats.rejected - before.rejected })); notifyMesh(); setPaste('');
    } catch { setResult(t('msg.invalid')); }
  };
  const onScan = (s: string, kind: 'bundle' | 'link') => {
    const r = asm.current.add(s);
    if (s.startsWith('SGMF1:')) { setProgress(t('msg.scan.progress', { a: r.have, b: r.total })); if (!r.done) return; s = r.text!; asm.current = new FrameAssembler(); }
    setScan(null); setProgress('');
    if (kind === 'bundle') void importText(s); else setLinkInput(s);
  };

  // live link (state lives in the hub so the link survives navigation)
  const [, force] = useState(0);
  useEffect(() => onLink(() => force((n) => n + 1)), []);
  const [linkInput, setLinkInput] = useState('');
  const { phase, code, peer } = link;
  const share = () => (navigator as any).share?.({ text: bundle }).catch(() => {});
  const copy = async (x: string) => { try { await navigator.clipboard.writeText(x); } catch { /* ignore */ } };
  return (
    <main class="stack">
      <h1>{t('msg.synctitle')}</h1>
      <p>{t('msg.syncintro')}</p>

      <section class="card stack"><h2>{t('msg.bundle')}</h2>
        <button onClick={make}>{t('msg.bundle.make')}</button>
        {bundle && <div class="stack"><p class="muted">{t('msg.bundle.count', { n: count })} · {t('msg.bundle.qr')}</p><MultiQr text={bundle} />
          <textarea readOnly rows={3} value={bundle} style="inline-size:100%" aria-label={t('msg.bundle')} onClick={(e) => (e.target as HTMLTextAreaElement).select()} />
          <div class="row"><button onClick={() => copy(bundle)}>{t('msg.bundle.copy')}</button>{'share' in navigator && <button onClick={share}>{t('gps.share')}</button>}</div></div>}
        <hr />
        <textarea rows={3} value={paste} onInput={(e) => setPaste((e.target as HTMLTextAreaElement).value)} placeholder={t('msg.bundle.paste')} aria-label={t('msg.bundle.paste')} style="inline-size:100%" />
        <div class="row"><button onClick={() => importText(paste)} disabled={!paste.trim()}>{t('msg.bundle.import')}</button>
          <button onClick={() => { asm.current = new FrameAssembler(); setScan(scan === 'bundle' ? null : 'bundle'); }}>{scan === 'bundle' ? t('msg.scan.stop') : `📷 ${t('msg.bundle.scan')}`}</button></div>
        {scan === 'bundle' && <QrScanner onText={(s) => onScan(s, 'bundle')} onError={() => { setScan(null); setResult(t('msg.scan.denied')); }} />}
        {progress && <p class="muted">{progress}</p>}
        {result && <p role="status">{result}</p>}
      </section>

      <section class="card stack"><h2>{t('msg.link')}</h2><p class="muted">{t('msg.link.hint')}</p>
        {!rtcSupported() ? <p class="danger-box">{t('msg.link.unsupported')}</p> : (
          <>
            {phase === 'idle' && <div class="row"><button onClick={() => void startHost()}>{t('msg.link.host')}</button><button onClick={startGuest}>{t('msg.link.guest')}</button></div>}
            {phase === 'host' && <div class="stack"><p>{t('msg.link.step1')}</p>{code ? <><MultiQr text={code} /><textarea readOnly rows={3} value={code} style="inline-size:100%" aria-label={t('msg.link.step1')} onClick={(e) => (e.target as HTMLTextAreaElement).select()} /><button onClick={() => copy(code)}>{t('msg.bundle.copy')}</button></> : <p>{t('app.loading')}</p>}
              <p>{t('msg.link.step2')}</p><textarea rows={3} value={linkInput} onInput={(e) => setLinkInput((e.target as HTMLTextAreaElement).value)} placeholder={t('msg.link.paste')} aria-label={t('msg.link.paste')} style="inline-size:100%" />
              <div class="row"><button class="btn-danger" onClick={() => { void submitAnswer(linkInput); setLinkInput(''); }} disabled={!linkInput.trim()}>{t('msg.link.apply')}</button><button onClick={() => { asm.current = new FrameAssembler(); setScan(scan === 'link' ? null : 'link'); }}>{scan === 'link' ? t('msg.scan.stop') : `📷 ${t('msg.bundle.scan')}`}</button></div>
              {scan === 'link' && <QrScanner onText={(s) => onScan(s, 'link')} onError={() => setScan(null)} />}<p class="muted">{t('msg.link.waiting')}</p></div>}
            {phase === 'guest' && <div class="stack">{!code ? <><textarea rows={3} value={linkInput} onInput={(e) => setLinkInput((e.target as HTMLTextAreaElement).value)} placeholder={t('msg.link.paste')} aria-label={t('msg.link.paste')} style="inline-size:100%" />
              <div class="row"><button class="btn-danger" onClick={() => { void submitOffer(linkInput); setLinkInput(''); }} disabled={!linkInput.trim()}>{t('msg.link.apply')}</button><button onClick={() => { asm.current = new FrameAssembler(); setScan(scan === 'link' ? null : 'link'); }}>{scan === 'link' ? t('msg.scan.stop') : `📷 ${t('msg.bundle.scan')}`}</button></div>
              {scan === 'link' && <QrScanner onText={(s) => onScan(s, 'link')} onError={() => setScan(null)} />}</> :
              <><p>{t('msg.link.answer')}</p><MultiQr text={code} /><textarea readOnly rows={3} value={code} style="inline-size:100%" aria-label={t('msg.link.answer')} onClick={(e) => (e.target as HTMLTextAreaElement).select()} /><button onClick={() => copy(code)}>{t('msg.bundle.copy')}</button><p class="muted">{t('msg.link.waiting')}</p></>}</div>}
            {phase === 'connected' && <p role="status" class="badge badge-warn">{t('msg.link.connected', { name: peer || '…' })}</p>}
            {phase === 'failed' && <p class="danger-box" role="alert">{t('msg.link.fail')}</p>}
            {phase !== 'idle' && <button onClick={() => hangup()}>{phase === 'connected' ? t('msg.link.close') : t('common.close')}</button>}
          </>
        )}
      </section>
      <p class="muted">{t('msg.native')}</p>
    </main>
  );
}
