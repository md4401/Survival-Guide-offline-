import type { ComponentChildren } from 'preact';
import { t } from '../i18n';
import { href, back } from '../router';

const TABS: Array<[string, string, string]> = [
  ['home', '', '🏠'], ['scenarios', 'scenarios', '⚠️'], ['guides', 'guides', '📖'], ['prepare', 'prepare', '🎒'], ['world', 'world', '🌍'],
];

export function Layout({ route, children }: { route: string; children: ComponentChildren }) {
  return (
    <>
      <header class="topbar">
        {route !== '' && <button onClick={back} aria-label={t('common.back')}>‹</button>}
        <a class="brand" href={href()}>{t('app.name')}</a>
        <a class="btn" href={href('search')} aria-label={t('common.search')}>🔍</a>
        <a class="btn" href={href('settings')} aria-label={t('settings.title')}>⚙️</a>
        <a class="btn btn-danger" href={href('emergency')}>{t('nav.emergency')}</a>
      </header>
      {children}
      <nav class="tabbar" aria-label={t('nav.main')}>
        {TABS.map(([k, r, icon]) => (
          <a href={href(...(r ? [r] : []))} aria-current={route === r ? 'page' : undefined}>
            <span aria-hidden="true">{icon}</span>
            <span>{t(`nav.${k}`)}</span>
          </a>
        ))}
      </nav>
    </>
  );
}
