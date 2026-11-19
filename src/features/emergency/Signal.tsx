import { useEffect, useRef, useState } from 'preact/hooks';
import { t } from '../../i18n';
import { href } from '../../router';
import { getGuide } from '../../content/loader';
import { GROUND_SIGNALS, SIGNAL_COLORS } from '../../data/signals';

export function Signal() {
  const [ack, setAck] = useState(false); const [on, setOn] = useState(false); const [ci, setCi] = useState(0); const [fast, setFast] = useState(false);
  const [lit, setLit] = useState(false); const wake = useRef<any>(null);
  const [hasGuide, setHasGuide] = useState(false);
  useEffect(() => { getGuide('comms.signals').then((g) => setHasGuide(!!g)).catch(() => {}); }, []);
  useEffect(() => {
    if (!on) return;
    let id = 0; (async () => { try { wake.current = await (navigator as any).wakeLock?.request('screen'); } catch { /* optional */ } })();
    id = window.setInterval(() => setLit((x) => !x), fast ? 333 : 500); // ≤ 3 Hz, below the usual photosensitivity range
    return () => { clearInterval(id); wake.current?.release?.().catch?.(() => {}); };
  }, [on, fast]);
  const [, a, b] = SIGNAL_COLORS[ci];
  return (
    <main class="stack">
      <h1>{t('signal.title')}</h1>
      <p class="danger-box" role="alert">{t('signal.warn')}</p>
      <label class="row"><input type="checkbox" checked={ack} onChange={(e) => setAck((e.target as HTMLInputElement).checked)} /><span>{t('signal.ack')}</span></label>
      <div class="row">{SIGNAL_COLORS.map(([k], i) => <button class={i === ci ? 'pill-on' : ''} onClick={() => setCi(i)}>{t(`signal.colors.${k}`)}</button>)}</div>
      <label class="row"><input type="checkbox" checked={fast} onChange={(e) => setFast((e.target as HTMLInputElement).checked)} /><span>{t('signal.fast')}</span></label>
      <button class="btn-danger btn-block help-btn" disabled={!ack} onClick={() => setOn(true)}>{t('signal.start')}</button>
      {on && <div class="light-overlay" style={{ background: lit ? a : b, alignItems: 'center' }} onClick={() => setOn(false)} role="button" aria-label={t('signal.stop')}><strong style={{ color: lit ? b : a, background: 'transparent', fontSize: '1.2em' }}>{t('signal.stop')}</strong></div>}
      <section class="card stack"><h2>{t('signal.ground')}</h2><p class="muted">{t('signal.ground.hint')}</p>
        <ul class="list">{GROUND_SIGNALS.map((g) => <li class="row card"><span class="big-num" style="min-inline-size:3rem;text-align:center">{g.mark}</span><span>{t(`signal.g.${g.id}`)}</span></li>)}</ul>
        <p>{t('signal.three')}</p><p class="muted">{t('signal.review')}</p>
        {hasGuide && <a class="btn" href={href('guide', 'comms.signals')}>{t('signal.mirror')}</a>}</section>
    </main>
  );
}
