import { useEffect, useRef, useState } from 'preact/hooks';
import { t } from '../../i18n';
import { getKV, setKV } from '../../db/dexie';
import { tilt, bubble, isLevel, ZERO, type Cal } from '../../lib/level';

export { clamp } from '../../lib/level';
export function Level() {
  const [raw, setRaw] = useState<[number, number] | null>(null); const [no, setNo] = useState(false); const [on, setOn] = useState(false); const [cal, setCal] = useState<Cal>(ZERO); const [locked, setLocked] = useState<{ x: number; y: number } | null>(null);
  const seen = useRef(false); const wasLevel = useRef(false);
  useEffect(() => { getKV<Cal>('levelCal', ZERO).then(setCal); }, []);
  useEffect(() => {
    if (!on) return; const h = (e: DeviceOrientationEvent) => { if (e.beta != null && e.gamma != null) { seen.current = true; setRaw([e.beta, e.gamma]); } };
    addEventListener('deviceorientation', h); const id = setTimeout(() => { if (!seen.current) setNo(true); }, 2500); return () => { removeEventListener('deviceorientation', h); clearTimeout(id); };
  }, [on]);
  const start = async () => { const D: any = (window as any).DeviceOrientationEvent; if (!D) { setNo(true); return; } try { if (typeof D.requestPermission === 'function' && (await D.requestPermission()) !== 'granted') { setNo(true); return; } } catch { setNo(true); return; } setOn(true); };
  const live = raw ? tilt(raw[0], raw[1], cal) : { x: 0, y: 0 }; const cur = locked ?? live; const b = bubble(cur.x, cur.y); const level = isLevel(cur.x, cur.y);
  useEffect(() => { if (level && !wasLevel.current) navigator.vibrate?.(40); wasLevel.current = level; }, [level]);
  const saveCal = (c: Cal) => { setCal(c); void setKV('levelCal', c); };
  return (
    <main class="stack"><h1>{t('level.title')}</h1><p class="muted">{t('level.hint')}</p>
      {!on && <button class="btn-block help-btn" onClick={start}>{t('compass.start')}</button>}
      {no && !raw && <p class="danger-box" role="alert">{t('dist.nosensor')}</p>}
      {on && raw && <>
        <svg viewBox="-100 -100 200 200" style="inline-size:100%;max-inline-size:22rem;margin-inline:auto;display:block" role="img" aria-label={t('level.title')} dir="ltr">
          <circle r="96" fill={level ? 'var(--neon)' : '#c9d64a'} stroke="#111" stroke-width="6" /><circle r="90" fill="none" stroke="rgba(255,255,255,.5)" stroke-width="2" />
          <line x1="-90" x2="90" y1="0" y2="0" stroke="#3a3f10" stroke-width="1" /><line y1="-90" y2="90" x1="0" x2="0" stroke="#3a3f10" stroke-width="1" /><circle r="19" fill="none" stroke="#3a3f10" stroke-width="1.5" />
          <circle cx={-b.x * 70} cy={-b.y * 70} r="17" fill="rgba(255,255,255,.35)" stroke="#3a3f10" stroke-width="1.5" /></svg>
        <div class="row" dir="ltr" style="justify-content:space-around"><b class="big-num" style="font-size:1.6rem">X: {cur.x.toFixed(1)}°</b><b class="big-num" style="font-size:1.6rem">Y: {cur.y.toFixed(1)}°</b></div>
        {level && <p class="badge" style="align-self:center">{t('level.flat')}</p>}
        <div class="row"><button class="btn" onClick={() => saveCal({ x: raw[1], y: raw[0] })}>{t('level.calibrate')}</button>{(cal.x !== 0 || cal.y !== 0) && <button class="btn" onClick={() => saveCal(ZERO)}>{t('level.reset')}</button>}<button class={`btn${locked ? ' primary' : ''}`} aria-pressed={!!locked} onClick={() => setLocked(locked ? null : { ...live })}>{locked ? '🔒' : '🔓'} {t('level.lock')}</button></div>
        <p class="muted">{t('level.calhelp')}</p></>}
    </main>
  );
}
