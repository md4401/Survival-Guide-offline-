import { t } from '../../i18n';

export function About() {
  return (
    <main class="stack">
      <h1>{t('about.title')}</h1>
      <p class="danger-box">{t('review.disclaimer')}</p>
      <section class="card"><h2>{t('about.privacy')}</h2>
        <ul><li>{t('about.p1')}</li><li>{t('about.p2')}</li><li>{t('about.p3')}</li><li>{t('about.p4')}</li></ul></section>
      <section class="card"><h2>{t('about.perms')}</h2>
        <ul><li>{t('about.perm.camera')}</li><li>{t('about.perm.location')}</li><li>{t('about.perm.sensors')}</li></ul></section>
      <section class="card"><h2>{t('about.content')}</h2><p>{t('about.content.text')}</p></section>
      <section class="card"><h2>{t('about.credits')}</h2><p>{t('about.credits.text')}</p></section>
      <p class="muted">{t('about.draft')}</p>
    </main>
  );
}
