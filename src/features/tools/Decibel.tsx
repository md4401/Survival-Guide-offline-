import { useEffect, useRef, useState } from 'preact/hooks';
import { t } from '../../i18n';
import { rms, toDb, bandOf, Stats } from '../../lib/audioLevel';
import { getKV, setKV } from '../../db/dexie';

export function Decibel() {
  const [on, setOn] = useState(false); const [db, setDb] = useState(0); const [hist, setHist] = useState<number[]>([]); const [off, setOff] = useState(90); const [msg, setMsg] = useState(''); const [, force] = useState(0);
  const stats = useRef(new Stats()); const stop = useRef<() => void>(() => {}); const offRef = useRef(90);
  useEffect(() => { getKV<number>('splOffset', 90).then((v) => { setOff(v); offRef.current = v; }); return () => stop.current(); }, []);
  const start = async () => {
    setMsg('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
      const Ctx = (window as any).AudioContext ?? (window as any).webkitAudioContext; const ctx = new Ctx(); const src = ctx.createMediaStreamSource(stream); const an = ctx.createAnalyser(); an.fftSize = 2048; src.connect(an);
      const buf = new Float32Array(an.fftSize); stats.current.reset();
      const id = setInterval(() => { an.getFloatTimeDomainData(buf); const v = toDb(rms(buf), offRef.current); stats.current.add(v); setDb(v); setHist((h) => [...h.slice(-59), v]); force((n) => n + 1); }, 200);
      stop.current = () => { clearInterval(id); stream.getTracks().forEach((x) => x.stop()); void ctx.close(); setOn(false); }; setOn(true);
    } catch { setMsg(t('spl.denied')); }
  };
  const band = bandOf(db); const s = stats.current;
  return (
    <main class="stack"><h1>{t('spl.title')}</h1><p class="danger-box">{t('spl.warn')}</p>
      {on ? <button class="btn-block btn-danger help-btn" onClick={() => stop.current()}>⏹ {t('rec.stop')}</button> : <button class="btn-block help-btn" onClick={start}>🔊 {t('spl.start')}</button>}
      {msg && <p class="danger-box" role="alert">{msg}</p>}
      <div class="card stack" style="text-align:center"><div class="big-num" dir="ltr" aria-live="off">{db.toFixed(0)} dB</div><strong>{on ? t(`spl.band.${band}`) : ''}</strong>
        <svg viewBox="0 0 120 40" style="inline-size:100%" role="img" aria-label={t('spl.title')}><polyline fill="none" stroke="currentColor" stroke-width="1.5" points={hist.map((v, i) => `${i * 2},${40 - (v / 140) * 40}`).join(' ')} /></svg>
        {s.n > 0 && <p class="muted" dir="ltr">{t('spl.stats', { min: s.min.toFixed(0), avg: s.avg.toFixed(0), max: s.max.toFixed(0) })}</p>}</div>
      <label class="row"><span style="flex:1">{t('spl.offset')}</span><input type="number" value={off} style="width:6rem" onInput={(e) => { const v = Number((e.target as HTMLInputElement).value) || 0; setOff(v); offRef.current = v; void setKV('splOffset', v); }} /></label>
      <p class="muted">{t('spl.help')}</p></main>
  );
}
