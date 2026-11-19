import { useEffect, useState } from 'preact/hooks';
import { t } from '../../i18n';

export const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
export function Level() {
  const [tilt, setTilt] = useState<[number, number] | null>(null); const [no, setNo] = useState(false); const [on, setOn] = useState(false);
  useEffect(() => { if (!on) return; const h = (e: DeviceOrientationEvent) => { if (e.beta != null && e.gamma != null) setTilt([e.beta, e.gamma]); }; addEventListener('deviceorientation', h); const id = setTimeout(() => setNo(!tilt), 2500); return () => { removeEventListener('deviceorientation', h); clearTimeout(id); }; }, [on]);
  const start = async () => { const D: any = (window as any).DeviceOrientationEvent; if (!D) { setNo(true); return; } try { if (typeof D.requestPermission === 'function' && (await D.requestPermission()) !== 'granted') { setNo(true); return; } } catch { setNo(true); return; } setOn(true); };
  const [b, g] = tilt ?? [0, 0]; const flat = Math.abs(b) < 1 && Math.abs(g) < 1;
  return (
    <main class="stack">
      <h1>{t('level.title')}</h1><p class="muted">{t('level.hint')}</p>
      {!on && <button class="btn-block help-btn" onClick={start}>{t('compass.start')}</button>}
      {no && !tilt && <p class="danger-box" role="alert">{t('dist.nosensor')}</p>}
      {on && tilt && <div class="card stack" style="text-align:center">
        <svg viewBox="-60 -60 120 120" style="inline-size:14rem;margin-inline:auto" role="img" aria-label={t('level.title')}><circle r="55" fill="none" stroke="currentColor" stroke-width="2" /><circle r="8" fill="none" stroke="currentColor" opacity=".5" /><circle cx={clamp(g * 3, -45, 45)} cy={clamp(b * 3, -45, 45)} r="9" fill={flat ? 'var(--ok)' : 'var(--accent)'} /></svg>
        <div class="big-num" dir="ltr">{t('level.deg', { a: b.toFixed(1), b: g.toFixed(1) })}</div>{flat && <strong>{t('level.flat')}</strong>}</div>}
    </main>
  );
}
