import { t } from '../../i18n';
import { href } from '../../router';

export function Prepare() {
  return (
    <main class="stack">
      <h1>{t('prepare.title')}</h1>
      <div class="grid2">
        <a class="btn tool" href={href('prepare', 'kit', '72h')}>🎒 {t('kit.title.72h')}</a>
        <a class="btn tool" href={href('prepare', 'kit', 'car')}>🚗 {t('kit.title.car')}</a>
        <a class="btn tool" href={href('prepare', 'score')}>✅ {t('score.title')}</a>
        <a class="btn tool" href={href('prepare', 'water')}>💧 {t('water.title')}</a>
        <a class="btn tool" href={href('prepare', 'family')}>👪 {t('prepare.family')}</a>
        <a class="btn tool" href={href('tools', 'timer')}>⏱ {t('timer.title')}</a>
        <a class="btn tool" href={href('tools', 'converter')}>🔄 {t('converter.title')}</a>
        <a class="btn tool" href={href('tools', 'morse')}>📡 {t('morse.title')}</a>
        <a class="btn tool" href={href('tools', 'notes')}>📝 {t('notes.title')}</a>
      </div>
    </main>
  );
}
