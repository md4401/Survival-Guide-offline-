import { t } from '../../i18n';
import { href } from '../../router';

export function Prepare() {
  return (
    <main class="stack">
      <h1>{t('prepare.title')}</h1>
      <div class="grid2">
        <a class="btn tool" href={href('prepare', 'kit', '72h')}>🎒 {t('kit.title.72h')}</a>
        <a class="btn tool" href={href('prepare', 'kit', 'car')}>🚗 {t('kit.title.car')}</a>
        <a class="btn tool" href={href('prepare', 'plan72')}>🗓 {t('prepare.plan72')}</a>
        <a class="btn tool" href={href('prepare', 'stock')}>🍚 {t('prepare.stock')}</a>
        <a class="btn tool" href={href('prepare', 'energy')}>🔋 {t('prepare.energy')}</a>
        <a class="btn tool" href={href('inventory')}>📦 {t('prepare.inventory')}</a>
        <a class="btn tool" href={href('prepare', 'docs')}>🗂 {t('prepare.docs')}</a>
        <a class="btn tool" href={href('library')}>📚 {t('lib.title')}</a>
        <a class="btn tool" href={href('learn')}>🎓 {t('learn.title')}</a>
        <a class="btn tool" href={href('prepare', 'score')}>✅ {t('score.title')}</a>
        <a class="btn tool" href={href('prepare', 'water')}>💧 {t('water.title')}</a>
        <a class="btn tool" href={href('prepare', 'family')}>👪 {t('prepare.family')}</a>
        <a class="btn tool" href={href('tools', 'timer')}>⏱ {t('timer.title')}</a>
        <a class="btn tool" href={href('tools', 'converter')}>🔄 {t('converter.title')}</a>
        <a class="btn tool" href={href('tools', 'morse')}>📡 {t('morse.title')}</a>
        <a class="btn tool" href={href('tools', 'distance')}>👣 {t('dist.title')}</a>
        <a class="btn tool" href={href('tools', 'level')}>📐 {t('level.title')}</a>
        <a class="btn tool" href={href('trail')}>🥾 {t('trail.title')}</a>
        <a class="btn tool" href={href('medcard')}>🩺 {t('medcard.title')}</a>
        <a class="btn tool" href={href('silent')}>🔇 {t('silent.title')}</a>
        <a class="btn tool" href={href('tools', 'notes')}>📝 {t('notes.title')}</a>
      </div>
    </main>
  );
}
