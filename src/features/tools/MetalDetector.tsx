import { useEffect, useRef, useState } from 'preact/hooks';
import { t } from '../../i18n';
import { getSettings } from '../../db/settings';
import { magnitude, Baseline, strength, beepEvery, available, startSensor } from '../../lib/magnetometer';

export function MetalDetector() {
  const [on, setOn] = useState(false); const [uT, setUT] = useState(0); const [str, setStr] = useState(0); const [ready, setReady] = useState(false); const [msg, setMsg] = useState('');
  const [ok, setOk] = useState<boolean | null>(null); const base = useRef(new Baseline(20)); const stopSensor = useRef<(() => void) | null>(null); const ctxRef = useRef<AudioContext | null>(null); const lastBeep = useRef(0);
  useEffect(() => { available().then(setOk).catch(() => setOk(false)); }, []);
  const stop = () => { stopSensor.current?.(); stopSensor.current = null; void ctxRef.current?.close(); ctxRef.current = null; setOn(false); };
  useEffect(() => stop, []);
  const beep = () => { const c = ctxRef.current; if (!c || getSettings().silent) return; const o = c.createOscillator(); const g = c.createGain(); o.frequency.value = 880; g.gain.value = 0.08; o.connect(g); g.connect(c.destination); o.start(); o.stop(c.currentTime + 0.06); };
  const start = async () => {
    setMsg(''); if (!ok) { setMsg(t('metal.unsupported')); return; }
    try {
      base.current.reset(); setReady(false);
      const Ctx = (window as any).AudioContext ?? (window as any).webkitAudioContext; ctxRef.current = new Ctx();
      stopSensor.current = await startSensor((x, y, z) => {
        const v = magnitude(x, y, z); setUT(v);
        if (!base.current.ready) { base.current.add(v); if (base.current.ready) setReady(true); return; }
        const k = strength(v, base.current.value); setStr(k); const every = beepEvery(k); const now = Date.now();
        if (every != null && now - lastBeep.current >= every) { lastBeep.current = now; beep(); navigator.vibrate?.(30); }
      }, () => { setMsg(t('metal.error')); stop(); });
      setOn(true);
    } catch { setMsg(t('metal.denied')); stop(); }
  };
  return (
    <main class="stack"><h1>{t('metal.title')}</h1><p class="danger-box">{t('metal.warn')}</p>
      {ok === false && <p class="danger-box" role="alert">{t('metal.unsupported')}</p>}
      {on ? <button class="btn-block btn-danger help-btn" onClick={stop}>⏹ {t('rec.stop')}</button> : <button class="btn-block help-btn" disabled={ok === false} onClick={start}>🧲 {t('metal.start')}</button>}
      {msg && <p class="danger-box" role="alert">{msg}</p>}
      {on && <div class="card stack" style="text-align:center">
        <p>{ready ? t('metal.ready') : t('metal.calibrating')}</p><div class="big-num" dir="ltr">{uT.toFixed(1)} µT</div>
        <progress max="100" value={Math.round(str * 100)} aria-label={t('metal.strength')} style="inline-size:100%" />
        <button class="btn" onClick={() => { base.current.reset(); setReady(false); setStr(0); }}>{t('metal.zero')}</button></div>}
      <p class="muted">{t('metal.help')}</p></main>
  );
}
