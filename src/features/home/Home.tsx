import { t } from '../../i18n';
import { href } from '../../router';

export function Home() {
  return (
    <main class="stack">
      <a class="btn btn-danger btn-block help-btn" href={href('triage')}>{t('home.help')}</a>
      <p class="muted">{t('home.tagline')}</p>
      <h2>{t('home.tools')}</h2>
      <div class="grid2">
        <a class="btn tool" href={href('torch')}>🔦 {t('home.torch')}</a>
        <a class="btn tool" href={href('whistle')}>📣 {t('home.whistle')}</a>
        <a class="btn tool" href={href('torch')}>🆘 {t('home.sos')}</a>
        <a class="btn tool" href={href('numbers')}>📞 {t('home.numbers')}</a>
        <a class="btn tool" href={href('gps')}>📍 {t('home.gps')}</a>
      </div>
    </main>
  );
}
