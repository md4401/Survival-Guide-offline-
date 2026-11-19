import { t } from '../../i18n';
import { href } from '../../router';

export function Prepare() {
  return (
    <main class="stack">
      <h1>{t('prepare.title')}</h1>
      <div class="grid2">
        <a class="btn tool" href={href('prepare', 'kit', '72h')}><span class="ico" aria-hidden="true">🎒</span><span>{t('kit.title.72h')}</span></a>
        <a class="btn tool" href={href('prepare', 'kit', 'car')}><span class="ico" aria-hidden="true">🚗</span><span>{t('kit.title.car')}</span></a>
        <a class="btn tool" href={href('prepare', 'plan72')}><span class="ico" aria-hidden="true">🗓</span><span>{t('prepare.plan72')}</span></a>
        <a class="btn tool" href={href('prepare', 'stock')}><span class="ico" aria-hidden="true">🍚</span><span>{t('prepare.stock')}</span></a>
        <a class="btn tool" href={href('prepare', 'energy')}><span class="ico" aria-hidden="true">🔋</span><span>{t('prepare.energy')}</span></a>
        <a class="btn tool" href={href('inventory')}><span class="ico" aria-hidden="true">📦</span><span>{t('prepare.inventory')}</span></a>
        <a class="btn tool" href={href('prepare', 'docs')}><span class="ico" aria-hidden="true">🗂</span><span>{t('prepare.docs')}</span></a>
        <a class="btn tool" href={href('library')}><span class="ico" aria-hidden="true">📚</span><span>{t('lib.title')}</span></a>
        <a class="btn tool" href={href('learn')}><span class="ico" aria-hidden="true">🎓</span><span>{t('learn.title')}</span></a>
        <a class="btn tool" href={href('prepare', 'score')}><span class="ico" aria-hidden="true">✅</span><span>{t('score.title')}</span></a>
        <a class="btn tool" href={href('prepare', 'water')}><span class="ico" aria-hidden="true">💧</span><span>{t('water.title')}</span></a>
        <a class="btn tool" href={href('prepare', 'family')}><span class="ico" aria-hidden="true">👪</span><span>{t('prepare.family')}</span></a>
        <a class="btn tool" href={href('tools')}><span class="ico" aria-hidden="true">🧰</span><span>{t('tools.title')}</span></a>
        <a class="btn tool" href={href('tools', 'timer')}><span class="ico" aria-hidden="true">⏱</span><span>{t('timer.title')}</span></a>
        <a class="btn tool" href={href('tools', 'converter')}><span class="ico" aria-hidden="true">🔄</span><span>{t('converter.title')}</span></a>
        <a class="btn tool" href={href('tools', 'morse')}><span class="ico" aria-hidden="true">📡</span><span>{t('morse.title')}</span></a>
        <a class="btn tool" href={href('tools', 'distance')}><span class="ico" aria-hidden="true">👣</span><span>{t('dist.title')}</span></a>
        <a class="btn tool" href={href('tools', 'level')}><span class="ico" aria-hidden="true">📐</span><span>{t('level.title')}</span></a>
        <a class="btn tool" href={href('trail')}><span class="ico" aria-hidden="true">🥾</span><span>{t('trail.title')}</span></a>
        <a class="btn tool" href={href('medcard')}><span class="ico" aria-hidden="true">🩺</span><span>{t('medcard.title')}</span></a>
        <a class="btn tool" href={href('silent')}><span class="ico" aria-hidden="true">🔇</span><span>{t('silent.title')}</span></a>
        <a class="btn tool" href={href('tools', 'notes')}><span class="ico" aria-hidden="true">📝</span><span>{t('notes.title')}</span></a>
      </div>
    </main>
  );
}
