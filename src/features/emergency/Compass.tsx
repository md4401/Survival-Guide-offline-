import { useEffect, useState } from 'preact/hooks';
import { t } from '../../i18n';
import { headingFromEvent, headingToCardinal } from '../../lib/compass';

export function Compass() {
  const [heading, setHeading] = useState<number | null>(null);
  const [state, setState] = useState<'idle' | 'on' | 'denied' | 'none'>('idle');
  useEffect(() => {
    if (state !== 'on') return;
    const on = (e: Event) => { const h = headingFromEvent(e as any); if (h != null) setHeading(Math.round(h)); };
    const evt = 'ondeviceorientationabsolute' in window ? 'deviceorientationabsolute' : 'deviceorientation';
    addEventListener(evt, on, true);
    const id = setTimeout(() => setHeading((h) => { if (h == null) setState('none'); return h; }), 3000);
    return () => { removeEventListener(evt, on, true); clearTimeout(id); };
  }, [state]);
  const start = async () => {
    const D: any = (window as any).DeviceOrientationEvent;
    if (!D) { setState('none'); return; }
    try { if (typeof D.requestPermission === 'function' && (await D.requestPermission()) !== 'granted') { setState('denied'); return; } } catch { setState('denied'); return; }
    setHeading(null); setState('on');
  };
  return (
    <main class="stack">
      <h1>{t('compass.title')}</h1>
      <p class="muted">{t('compass.hint')}</p>
      {state === 'idle' || state === 'denied' || state === 'none' ? <button class="btn-block help-btn" onClick={start}>{t('compass.start')}</button> : null}
      {state === 'denied' && <p class="danger-box" role="alert">{t('compass.denied')}</p>}
      {state === 'none' && <p class="danger-box" role="alert">{t('compass.none')}</p>}
      {state === 'on' && heading != null && (
        <div class="card stack" style="text-align:center">
          <div class="big-num" dir="ltr">{heading}° {t(`compass.${headingToCardinal(heading)}`)}</div>
          <svg viewBox="-60 -60 120 120" role="img" aria-label={`${heading}°`} style="inline-size:14rem;margin-inline:auto">
            <circle r="56" fill="none" stroke="currentColor" stroke-width="2" />
            <text y="-42" text-anchor="middle" fill="currentColor" font-size="12" transform={`rotate(${-heading})`}>N</text>
            <g transform={`rotate(${-heading})`}><polygon points="0,-48 6,0 -6,0" fill="#ff5a5f" /><polygon points="0,48 6,0 -6,0" fill="currentColor" opacity=".5" /></g>
            <polygon points="0,-62 4,-56 -4,-56" fill="var(--accent)" />
          </svg>
        </div>
      )}
      {state === 'on' && heading == null && <p>{t('compass.waiting')}</p>}
      <p class="muted">{t('compass.calibrate')}</p>
    </main>
  );
}
