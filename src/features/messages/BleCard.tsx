import { useEffect, useRef, useState } from 'preact/hooks';
import { t } from '../../i18n';
import { bleSupported, startBle } from '../../lib/mesh/ble';

/** Bluetooth mesh switch (Android app only). Off by default. */
export function BleCard() {
  const [ok, setOk] = useState(false); const [on, setOn] = useState(false); const [peers, setPeers] = useState(0); const [err, setErr] = useState(''); const stop = useRef<(() => void) | null>(null);
  useEffect(() => { void bleSupported().then(setOk); return () => stop.current?.(); }, []);
  if (!ok) return null;
  const toggle = async () => {
    setErr('');
    if (on) { stop.current?.(); stop.current = null; setOn(false); return; }
    try { stop.current = await startBle(setPeers); setOn(true); } catch (e) { const m = String((e as Error).message); setErr(t(m === 'denied' ? 'ble.denied' : m === 'off' ? 'ble.off' : 'ble.unavailable')); }
  };
  return (
    <section class="card stack"><h2>📡 {t('ble.title')}</h2><p class="muted">{t('ble.hint')}</p>
      <button class="btn primary" aria-pressed={on} onClick={toggle}>{on ? t('ble.stop') : t('ble.start')}</button>
      {on && <p aria-live="polite">{t('ble.peers', { n: peers })}</p>}{err && <p class="danger-box" role="alert">{err}</p>}
      <p class="muted">{t('ble.warn')}</p></section>
  );
}
