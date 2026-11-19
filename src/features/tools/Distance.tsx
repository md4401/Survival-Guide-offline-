import { useEffect, useRef, useState } from 'preact/hooks';
import { t } from '../../i18n';
import { getKV, setKV } from '../../db/dexie';
import { StepCounter, strideFromCalibration, strideFromHeight, walkedMeters } from '../../lib/steps';

export function Distance() {
  const [stride, setStride] = useState(0.7); const [steps, setSteps] = useState(0); const [on, setOn] = useState(false); const [no, setNo] = useState(false);
  const [known, setKnown] = useState('30'); const [height, setHeight] = useState('1.70'); const [mm, setMm] = useState(85.6); const [pxmm, setPxmm] = useState(3.78);
  const sc = useRef(new StepCounter()); const handler = useRef<any>(null);
  useEffect(() => { getKV<number>('stride', 0.7).then(setStride); getKV<number>('pxmm', 3.78).then(setPxmm); return () => stop(); }, []);
  const stop = () => { if (handler.current) removeEventListener('devicemotion', handler.current); handler.current = null; setOn(false); };
  const start = async () => {
    const D: any = (window as any).DeviceMotionEvent; if (!D) { setNo(true); return; }
    try { if (typeof D.requestPermission === 'function' && (await D.requestPermission()) !== 'granted') { setNo(true); return; } } catch { setNo(true); return; }
    handler.current = (e: DeviceMotionEvent) => { const a = e.accelerationIncludingGravity; if (a && a.x != null) { if (sc.current.push({ t: performance.now(), x: a.x!, y: a.y!, z: a.z! })) setSteps(sc.current.steps); } };
    addEventListener('devicemotion', handler.current); setOn(true);
  };
  const reset = () => { sc.current = new StepCounter(); setSteps(0); };
  return (
    <main class="stack">
      <h1>{t('dist.title')}</h1>
      <section class="card stack"><h2>{t('dist.steps')}</h2>
        <div class="big-num">{t('dist.walked', { s: steps, m: Math.round(walkedMeters(steps, stride)) })}</div>
        <div class="row">{!on ? <button class="btn-danger" onClick={start}>{t('dist.start')}</button> : <button onClick={stop}>{t('dist.stop')}</button>}<button onClick={reset}>{t('dist.reset')}</button></div>
        {no && <p class="danger-box" role="alert">{t('dist.nosensor')}</p>}
        <label class="row"><span style="flex:1">{t('dist.stride')}</span><input type="number" step="0.01" min="0.3" max="1.5" value={stride} style="inline-size:6rem" onInput={(e) => { const v = Number((e.target as HTMLInputElement).value); if (v > 0) { setStride(v); void setKV('stride', v); } }} /></label>
        <label class="row"><span style="flex:1">{t('dist.height')}</span><input type="number" step="0.01" value={height} style="inline-size:6rem" onInput={(e) => setHeight((e.target as HTMLInputElement).value)} /><button onClick={() => { const v = strideFromHeight(Number(height)); if (v > 0) { setStride(+v.toFixed(2)); void setKV('stride', +v.toFixed(2)); } }}>{t('dist.apply')}</button></label>
        <p class="muted">{t('dist.calibrate')}</p>
        <label class="row"><span style="flex:1">{t('dist.known')}</span><input type="number" value={known} style="inline-size:6rem" onInput={(e) => setKnown((e.target as HTMLInputElement).value)} /><button onClick={() => { const v = strideFromCalibration(Number(known), steps); if (v > 0) { setStride(+v.toFixed(2)); void setKV('stride', +v.toFixed(2)); } }} disabled={steps === 0}>{t('dist.apply')}</button></label>
      </section>
      <section class="card stack"><h2>{t('dist.ruler')}</h2><p class="muted">{t('dist.ruler.hint')}</p>
        <div style={{ inlineSize: `${mm * pxmm}px`, blockSize: `${53.98 * pxmm}px`, border: '2px dashed var(--accent)', borderRadius: '8px' }} aria-hidden="true" />
        <label class="row"><span>{t('dist.ruler.size')}</span><input type="range" min="2" max="6" step="0.01" value={pxmm} onInput={(e) => { const v = Number((e.target as HTMLInputElement).value); setPxmm(v); void setKV('pxmm', v); }} style="flex:1" /></label>
        <div dir="ltr" style={{ position: 'relative', blockSize: '3rem', inlineSize: `${100 * pxmm}px`, borderBottom: '2px solid var(--text)' }} aria-hidden="true">
          {Array.from({ length: 101 }, (_, i) => <span style={{ position: 'absolute', insetInlineStart: `${i * pxmm}px`, insetBlockEnd: 0, inlineSize: '1px', blockSize: i % 10 === 0 ? '1.6rem' : i % 5 === 0 ? '1.1rem' : '.6rem', background: 'var(--text)' }} />)}
        </div><p class="muted" dir="ltr">0 — 10 cm</p>
      </section>
    </main>
  );
}
