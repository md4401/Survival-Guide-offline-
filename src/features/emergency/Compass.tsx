import { useEffect, useRef, useState } from 'preact/hooks';
import { t } from '../../i18n';
import { headingFromEvent, headingToCardinal } from '../../lib/compass';
import { smooth, ticks } from '../../lib/dial';
import { coordParts } from '../../lib/coords';

const TICKS = ticks();
export function Compass() {
  const [heading, setHeading] = useState<number | null>(null); const [state, setState] = useState<'idle' | 'on' | 'denied' | 'none'>('idle'); const [pos, setPos] = useState<{ lat: number; lon: number } | null>(null); const [gpsErr, setGpsErr] = useState(false);
  const last = useRef<number | null>(null);
  useEffect(() => {
    if (state !== 'on') return;
    const on = (e: Event) => { const h = headingFromEvent(e as any); if (h != null) { last.current = smooth(last.current, h, 0.3); setHeading(Math.round(last.current)); } };
    const evt = 'ondeviceorientationabsolute' in window ? 'deviceorientationabsolute' : 'deviceorientation';
    addEventListener(evt, on, true);
    const id = setTimeout(() => setHeading((h) => { if (h == null) setState('none'); return h; }), 3000);
    return () => { removeEventListener(evt, on, true); clearTimeout(id); };
  }, [state]);
  const start = async () => {
    const D: any = (window as any).DeviceOrientationEvent;
    if (!D) { setState('none'); return; }
    try { if (typeof D.requestPermission === 'function' && (await D.requestPermission()) !== 'granted') { setState('denied'); return; } } catch { setState('denied'); return; }
    last.current = null; setHeading(null); setState('on');
    navigator.geolocation?.getCurrentPosition((p) => { setPos({ lat: p.coords.latitude, lon: p.coords.longitude }); setGpsErr(false); }, () => setGpsErr(true), { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 });
  };
  const cp = pos ? coordParts(pos.lat, pos.lon) : null; const h = heading ?? 0;
  return (
    <main class="stack">
      <h1>{t('compass.title')}</h1>
      <p class="muted">{t('compass.hint')}</p>
      {state === 'idle' || state === 'denied' || state === 'none' ? <button class="btn-block help-btn" onClick={start}>{t('compass.start')}</button> : null}
      {state === 'denied' && <p class="danger-box" role="alert">{t('compass.denied')}</p>}
      {state === 'none' && <p class="danger-box" role="alert">{t('compass.none')}</p>}
      {state === 'on' && heading != null && (
        <div class="stack" style="text-align:center">
          <div class="big-num" dir="ltr" style="font-size:3.4rem">{t(`compass.${headingToCardinal(heading)}`)} {heading}°</div>
          <svg viewBox="-115 -125 230 240" role="img" aria-label={`${heading}°`} dir="ltr" style="inline-size:100%;max-inline-size:22rem;margin-inline:auto;display:block">
            <polygon points="0,-122 6,-110 -6,-110" fill="currentColor" />
            <g transform={`rotate(${-h})`}>
              {TICKS.map((k) => <line x1="0" x2="0" y1={-104} y2={k.long ? -94 : -99} stroke="currentColor" stroke-width={k.deg % 90 === 0 ? 2.4 : k.long ? 1.4 : 0.6} opacity={k.long ? 0.9 : 0.5} transform={`rotate(${k.deg})`} />)}
              {TICKS.filter((k) => k.label).map((k) => <text y="-80" text-anchor="middle" font-size="10" fill="currentColor" opacity=".75" transform={`rotate(${k.deg}) `}>{k.deg}</text>)}
              {[['N', 0], ['E', 90], ['S', 180], ['W', 270]].map(([l, a]) => <text y="-58" text-anchor="middle" font-size="18" font-weight="800" fill={l === 'N' ? '#e5503f' : 'currentColor'} transform={`rotate(${a})`}>{t(`compass.${l as 'N'}`)}</text>)}
              <polygon points="0,-90 -4,-82 4,-82" fill="#e5503f" />
            </g>
            <line x1="-26" x2="26" y1="0" y2="0" stroke="currentColor" opacity=".35" /><line y1="-26" y2="26" x1="0" x2="0" stroke="currentColor" opacity=".35" />
          </svg>
          <div class="row" style="justify-content:space-around" dir="ltr">
            {cp ? <><div><div class="muted">{t('compass.lat')} {t(`hem.${cp.lat.hem}`)}</div><b class="big-num" style="font-size:1.4rem">{cp.lat.text}</b></div><div><div class="muted">{t('compass.lon')} {t(`hem.${cp.lon.hem}`)}</div><b class="big-num" style="font-size:1.4rem">{cp.lon.text}</b></div></> : <span class="muted">{gpsErr ? t('compass.nogps') : t('compass.locating')}</span>}
          </div>
        </div>
      )}
      {state === 'on' && heading == null && <p>{t('compass.waiting')}</p>}
      <p class="muted">{t('compass.calibrate')}</p>
    </main>
  );
}
