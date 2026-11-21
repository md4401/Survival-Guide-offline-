import type { ComponentChildren } from 'preact';
import { t } from '../i18n';
import { useEffect, useState } from 'preact/hooks';
import { href, back } from '../router';
import { applyUpdate, onUpdateChange, updateAllowed } from '../pwa';

const TABS: Array<[string, string, string]> = [
  ['home', '', '🏠'], ['explore', 'explore', '🧭'], ['tools', 'tools', '🧰'], ['prepare', 'prepare', '🎒'], ['more', 'more', '☰'],
];
/** Which tab stays highlighted for each route. */
const TAB_OF: Record<string, string> = {
  guide: 'explore', guides: 'explore', scenarios: 'explore', search: 'explore', library: 'explore', learn: 'explore', assistant: 'explore',
  compass: 'tools', gps: 'tools', torch: 'tools', whistle: 'tools', numbers: 'tools', signal: 'tools', trail: 'tools', medcard: 'tools', silent: 'tools',
  inventory: 'prepare', crisis: 'prepare',
  world: 'more', messages: 'more', settings: 'more', system: 'more', plans: 'more', about: 'more', legal: 'more',
};
export const tabOf = (route: string) => (TABS.some(([, r]) => r === route) ? route : TAB_OF[route] ?? '');

export function Layout({ route, children }: { route: string; children: ComponentChildren }) {
  const [upd, setUpd] = useState(false);
  useEffect(() => { const check = () => updateAllowed().then(setUpd); check(); return onUpdateChange(check); }, [route]);
  const quiet = ['emergency', 'triage', 'crisis', 'torch', 'whistle', 'gps', 'numbers'].includes(route);
  return (
    <>
      <header class="topbar">
        {route !== '' && <button onClick={back} aria-label={t('common.back')}><span class="flip">‹</span></button>}
        <a class="brand" href={href()}>{t('app.name')}</a>
        <a class="btn" href={href('search')} aria-label={t('common.search')}>🔍</a>
        <a class="btn" href={href('settings')} aria-label={t('settings.title')}>⚙️</a>
        <a class="btn btn-danger" href={href('emergency')}>{t('nav.emergency')}</a>
      </header>
      {upd && !quiet && <div class="card row" role="status"><span style="flex:1">{t('update.available')}</span><button onClick={() => applyUpdate()}>{t('update.apply')}</button></div>}
      {children}
      <nav class="tabbar" aria-label={t('nav.main')}>
        {TABS.map(([k, r, icon]) => (
          <a href={href(...(r ? [r] : []))} aria-current={tabOf(route) === r ? 'page' : undefined}>
            <span aria-hidden="true">{icon}</span>
            <span>{t(`nav.${k}`)}</span>
          </a>
        ))}
      </nav>
    </>
  );
}
