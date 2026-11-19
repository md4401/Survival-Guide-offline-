import { useState } from 'preact/hooks';
import { t } from '../../i18n';
import { formatDecimal, formatDms, shareText, type Fix } from '../../lib/coords';

export function Gps() {
  const [fix, setFix] = useState<Fix | null>(null);
  const [status, setStatus] = useState<'idle' | 'busy' | 'denied'>('idle');
  const [copied, setCopied] = useState(false);
  const get = () => {
    setStatus('busy');
    navigator.geolocation?.getCurrentPosition(
      (p) => { setFix({ lat: p.coords.latitude, lon: p.coords.longitude, accuracy: p.coords.accuracy, time: p.timestamp }); setStatus('idle'); },
      () => setStatus('denied'),
      { enableHighAccuracy: true, timeout: 60000, maximumAge: 0 },
    ) ?? setStatus('denied');
  };
  const text = fix ? shareText(fix, { lat: t('gps.lat'), lon: t('gps.lon'), acc: t('gps.acc'), time: t('gps.time') }) : '';
  const copy = async () => { try { await navigator.clipboard.writeText(text); setCopied(true); } catch { /* ignore */ } };
  const share = () => (navigator as any).share?.({ text }).catch(() => {});
  return (
    <main class="stack">
      <h1>{t('gps.title')}</h1>
      <p class="muted">{t('gps.hint')}</p>
      <button class="btn-block help-btn" onClick={get} disabled={status === 'busy'}>{status === 'busy' ? t('gps.locating') : t('gps.get')}</button>
      {status === 'denied' && <p class="danger-box" role="alert">{t('gps.denied')}</p>}
      {fix && (
        <section class="card stack">
          <div class="big-num">{formatDecimal(fix)}</div>
          <div>{formatDms(fix)}</div>
          {fix.accuracy != null && <div class="muted">{t('gps.acc')}: {Math.round(fix.accuracy)} m</div>}
          <pre style="white-space:pre-wrap">{text}</pre>
          <div class="row">
            <button onClick={copy}>{copied ? t('gps.copied') : t('gps.copy')}</button>
            <a class="btn" href={`sms:?body=${encodeURIComponent(text)}`}>{t('gps.sms')}</a>
            {'share' in navigator && <button onClick={share}>{t('gps.share')}</button>}
          </div>
        </section>
      )}
    </main>
  );
}
