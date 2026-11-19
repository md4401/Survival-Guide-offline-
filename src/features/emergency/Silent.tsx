import { useRef } from 'preact/hooks';
import { t } from '../../i18n';
import { updateSettings, useSettings } from '../../db/settings';
import { PremiumGate } from '../../components/PremiumGate';

function Inner() {
  const s = useSettings(); const timer = useRef(0); const dark = useRef(false);
  const show = () => { dark.current = true; document.documentElement.requestFullscreen?.().catch(() => {}); updateSettings({ silent: true }); location.hash = '#/silent/on'; };
  const on = location.hash.endsWith('/on');
  if (on) {
    const down = () => { timer.current = window.setTimeout(() => { updateSettings({ silent: false }); document.exitFullscreen?.().catch(() => {}); location.hash = '#/silent'; }, 1500); };
    return <div style="position:fixed;inset:0;background:#000;z-index:99" onPointerDown={down} onPointerUp={() => clearTimeout(timer.current)} onPointerLeave={() => clearTimeout(timer.current)} role="button" aria-label={t('silent.hint')} />;
  }
  return (
    <main class="stack"><h1>{t('silent.title')}</h1><p>{t('silent.hint')}</p>
      {s.silent && <p class="badge badge-warn" role="status">{t('silent.active')}</p>}
      <button class="btn-danger btn-block help-btn" onClick={show}>{t('silent.on')}</button>
      {s.silent && <button class="btn-block" onClick={() => updateSettings({ silent: false })}>{t('silent.off')}</button>}</main>
  );
}
export const Silent = () => <PremiumGate><Inner /></PremiumGate>;
