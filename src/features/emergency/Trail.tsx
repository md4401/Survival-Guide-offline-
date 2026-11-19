import { useEffect, useRef, useState } from 'preact/hooks';
import { t } from '../../i18n';
import { getKV, setKV } from '../../db/dexie';
import { PremiumGate } from '../../components/PremiumGate';
import { addPoint, trackLength, wayBack, relativeAngle, type P } from '../../lib/track';
import { headingFromEvent } from '../../lib/compass';

const fmtD = (m: number) => (m >= 1000 ? `${(m / 1000).toFixed(2)} km` : `${Math.round(m)} m`);
function TrailInner() {
  const [track, setTrack] = useState<P[]>([]); const [rec, setRec] = useState(false); const [here, setHere] = useState<P | null>(null); const [heading, setHeading] = useState<number | null>(null);
  const wid = useRef<number | null>(null); const ref = useRef<P[]>([]);
  useEffect(() => { getKV<P[]>('trail', []).then((x) => { setTrack(x); ref.current = x; }); const on = (e: Event) => { const h = headingFromEvent(e as any); if (h != null) setHeading(h); }; addEventListener('deviceorientationabsolute', on, true); addEventListener('deviceorientation', on, true); return () => { removeEventListener('deviceorientationabsolute', on, true); removeEventListener('deviceorientation', on, true); stop(); }; }, []);
  const watch = () => { wid.current = navigator.geolocation?.watchPosition((pos) => {
    const p: P = { lat: pos.coords.latitude, lon: pos.coords.longitude, t: pos.timestamp, acc: pos.coords.accuracy }; setHere(p);
    ref.current = addPoint(ref.current, p); setTrack(ref.current); void setKV('trail', ref.current);
  }, () => {}, { enableHighAccuracy: true, maximumAge: 5000 }) ?? null; };
  const stop = () => { if (wid.current != null) navigator.geolocation?.clearWatch(wid.current); wid.current = null; setRec(false); };
  const start = () => { setRec(true); watch(); };
  const wb = here ? wayBack(track, here) : null;
  return (
    <main class="stack">
      <h1>{t('trail.title')}</h1><p class="muted">{t('trail.hint')}</p>
      <div class="row">{!rec ? <button class="btn-danger" onClick={start}>{t('trail.start')}</button> : <button onClick={stop}>{t('trail.stop')}</button>}
        <button onClick={() => { ref.current = []; setTrack([]); void setKV('trail', []); }}>{t('trail.clear')}</button></div>
      {rec && <p role="status" class="badge badge-warn">{t('trail.recording')}</p>}
      <p>{t('trail.points', { n: track.length, d: fmtD(trackLength(track)) })}</p>
      {wb && <section class="card stack"><h2>{t('trail.back')}</h2>
        {wb.atStart ? <p>{t('trail.atstart')}</p> : <>
          <p>{t('trail.direct', { d: fmtD(wb.direct.distance), b: Math.round(wb.direct.bearing) })}</p><p>{t('trail.next', { d: fmtD(wb.nextPoint.distance), b: Math.round(wb.nextPoint.bearing) })}</p>
          {heading != null && <svg viewBox="-50 -50 100 100" style="inline-size:10rem;margin-inline:auto" role="img" aria-label={t('trail.arrow')}><g transform={`rotate(${relativeAngle(wb.nextPoint.bearing, heading)})`}><polygon points="0,-42 14,10 0,2 -14,10" fill="var(--accent)" /></g></svg>}
          <p class="muted">{t('trail.arrow')}</p></>}</section>}
    </main>
  );
}
export const Trail = () => <PremiumGate><TrailInner /></PremiumGate>;
