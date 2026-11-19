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
        <a class="btn tool" href={href('torch')}>🔦 {t('home.torch')}</a>
        <a class="btn tool" href={href('whistle')}>📣 {t('home.whistle')}</a>
        <a class="btn tool" href={href('gps')}>📍 {t('home.gps')}</a>
        <a class="btn tool" href={href('messages')}>💬 {t('home.messages')}</a>
        <a class="btn tool" href={href('signal')}>🚨 {t('signal.title')}</a>
        <a class="btn tool" href={href('compass')}>🧭 {t('compass.title')}</a>
      </div>
    </main>
  );
}
