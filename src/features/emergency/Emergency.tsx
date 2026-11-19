import { t } from '../../i18n';
import { href } from '../../router';
import { NumbersList } from './Numbers';

export function Emergency() {
  return (
    <main class="stack">
      <h1>{t('emergency.title')}</h1>
      <a class="btn btn-danger btn-block help-btn" href={href('triage')}>{t('home.help')}</a>
      <NumbersList />
      <h2>{t('emergency.tools')}</h2>
      <div class="grid2">
        <a class="btn tool" href={href('torch')}><span class="ico" aria-hidden="true">🔦</span><span>{t('home.torch')}</span></a>
        <a class="btn tool" href={href('whistle')}><span class="ico" aria-hidden="true">📣</span><span>{t('home.whistle')}</span></a>
        <a class="btn tool" href={href('gps')}><span class="ico" aria-hidden="true">📍</span><span>{t('home.gps')}</span></a>
        <a class="btn tool" href={href('messages')}><span class="ico" aria-hidden="true">💬</span><span>{t('home.messages')}</span></a>
        <a class="btn tool" href={href('signal')}><span class="ico" aria-hidden="true">🚨</span><span>{t('signal.title')}</span></a>
        <a class="btn tool" href={href('compass')}><span class="ico" aria-hidden="true">🧭</span><span>{t('compass.title')}</span></a>
      </div>
    </main>
  );
}
