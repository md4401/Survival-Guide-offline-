import { useEffect, useRef, useState } from 'preact/hooks';
import { t } from '../../i18n';
import { getSettings } from '../../db/settings';
import { magnitude, Baseline, strength, beepEvery, available, startSensor } from '../../lib/magnetometer';
import { Series } from '../../lib/audioLevel';
import { Graph } from '../../components/Graph';

const MAX_UT = 200;
export function MetalDetector() {
  const [on, setOn] = useState(false); const [ready, setReady] = useState(false); const [msg, setMsg] = useState(''); const [ok, setOk] = useState<boolean | null>(null); const [sound, setSound] = useState(true); const [, force] = useState(0);
  const base = useRef(new Baseline(20)); const stopSensor = useRef<(() => void) | null>(null); const ctxRef = useRef<AudioContext | null>(null); const lastBeep = useRef(0); const soundRef = useRef(true);
  const cur = useRef({ v: 0, x: 0, y: 0, z: 0, k: 0 }); const series = useRef(new Series(30000));
  useEffect(() => { available().then(setOk).catch(() => setOk(false)); }, []);
  const stop = () => { stopSensor.current?.(); stopSensor.current = null; void ctxRef.current?.close(); ctxRef.current = null; setOn(false); };
  useEffect(() => stop, []);
  useEffect(() => { if (!on) return; const id = setInterval(() => force((n) => n + 1), 200); return () => clearInterval(id); }, [on]);
  const beep = () => { const c = ctxRef.current; if (!c || !soundRef.current || getSettings().silent) return; const o = c.createOscillator(); const g = c.createGain(); o.frequency.value = 880; g.gain.value = 0.08; o.connect(g); g.connect(c.destination); o.start(); o.stop(c.currentTime + 0.06); };
  const start = async () => {
    setMsg(''); if (!ok) { setMsg(t('metal.unsupported')); return; }
    try {
      base.current.reset(); setReady(false); series.current.reset();
      const Ctx = (window as any).AudioContext ?? (window as any).webkitAudioContext; ctxRef.current = new Ctx();
      stopSensor.current = await startSensor((x, y, z) => {
        const v = magnitude(x, y, z); const now = Date.now(); series.current.add(now, v);
        if (!base.current.ready) { base.current.add(v); cur.current = { v, x, y, z, k: 0 }; if (base.current.ready) setReady(true); return; }
        const k = strength(v, base.current.value); cur.current = { v, x, y, z, k };
        const every = beepEvery(k); if (every != null && now - lastBeep.current >= every) { lastBeep.current = now; beep(); navigator.vibrate?.(30); }
      }, () => { setMsg(t('metal.error')); stop(); });
      setOn(true);
    } catch { setMsg(t('metal.denied')); stop(); }
  };
  const c = cur.current; const frac = Math.min(1, c.v / MAX_UT); const R = 70; const circ = 2 * Math.PI * R;
  return (
    <main class="stack"><h1>{t('metal.title')}</h1><p class="danger-box">{t('metal.warn')}</p>
      {ok === false && <p class="danger-box" role="alert">{t('metal.unsupported')}</p>}
      {msg && <p class="danger-box" role="alert">{msg}</p>}
      <div class="card stack" style="text-align:center">
        <div class="row" style="justify-content:space-between"><span class="muted">{t('metal.field')}</span><button class="btn" aria-label={sound ? t('metal.soundoff') : t('metal.soundon')} onClick={() => { soundRef.current = !sound; setSound(!sound); }}>{sound ? '🔊' : '🔇'}</button></div>
        <svg viewBox="-90 -90 180 180" role="img" aria-label={`${c.v.toFixed(0)} µT`} style="inline-size:15rem;margin-inline:auto" dir="ltr">
          <circle r={R} fill="none" stroke="var(--border-strong)" stroke-width="12" /><circle r={R} fill="none" stroke={c.k > 0.5 ? '#e5503f' : 'var(--neon)'} stroke-width="12" stroke-linecap="round" stroke-dasharray={`${frac * circ} ${circ}`} transform="rotate(-90)" />
          <text y="12" text-anchor="middle" font-size="46" font-weight="800" fill="currentColor" font-family="var(--font-display)">{Math.round(c.v)}</text><text y="34" text-anchor="middle" font-size="14" fill="currentColor">µT</text></svg>
        <div dir="ltr"><div class="row" style="justify-content:space-between"><span>0</span><b>{Math.round(c.v)}</b><span>{MAX_UT} µT</span></div><progress max={MAX_UT} value={Math.min(MAX_UT, c.v)} style="inline-size:100%" aria-label={t('metal.strength')} /></div>
        <p dir="ltr" class="muted">x={c.x.toFixed(0)}, y={c.y.toFixed(0)}, z={c.z.toFixed(0)}</p>
        <p>{on ? (ready ? t('metal.ready') : t('metal.calibrating')) : ''}</p></div>
      <Graph pts={series.current.pts} now={Date.now()} yMin={0} yMax={MAX_UT} step={50} color="var(--neon)" label={t('metal.field')} unit="µT" />
      <div class="row">{on ? <><button class="btn btn-danger" onClick={stop}>⏹ {t('rec.stop')}</button><button class="btn" onClick={() => { base.current.reset(); setReady(false); }}>{t('metal.zero')}</button></> : <button class="btn-block help-btn" disabled={ok === false} onClick={start}>🧲 {t('metal.start')}</button>}</div>
      <p class="muted">{t('metal.help')}</p></main>
  );
}
