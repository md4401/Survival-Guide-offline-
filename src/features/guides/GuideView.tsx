import { useEffect, useState } from 'preact/hooks';
import type { Guide } from '../../content/types';
import { getGuide, loadGuides } from '../../content/loader';
import { t, isFallback } from '../../i18n';
import { href } from '../../router';
import { db } from '../../db/dexie';
import { useSettings } from '../../db/settings';

export function ReviewSeal({ g }: { g: Guide }) {
  return (
    <p class="muted">
      <span class="badge">{t(`review.${g.review.level}`)}</span>{' '}
      {g.needsReview && <span class="badge badge-warn">{t('review.needs')}</span>}{' '}
      <span>{t('review.date', { date: g.review.date })}</span> · <span>{t('review.source', { source: g.review.source })}</span>
    </p>
  );
}

export function FavButton({ id }: { id: string }) {
  const [on, setOn] = useState(false);
  useEffect(() => { db.favorites.get(id).then((f) => setOn(!!f)).catch(() => {}); }, [id]);
  const toggle = async () => {
    try { if (on) await db.favorites.delete(id); else await db.favorites.put({ id, at: Date.now() }); setOn(!on); } catch { /* storage unavailable */ }
  };
  return <button onClick={toggle} aria-pressed={on} aria-label={t('fav.toggle')}>{on ? '★' : '☆'}</button>;
}

export function GuideView({ id }: { id: string }) {
  useSettings();
  const [g, setG] = useState<Guide | null | undefined>(undefined);
  const [titles, setTitles] = useState<Record<string, string>>({});
  useEffect(() => {
    setG(undefined);
    getGuide(id).then((x) => {
      setG(x ?? null);
      if (x) db.history.put({ id, at: Date.now() }).catch(() => {});
    });
    loadGuides().then(({ guides }) => setTitles(Object.fromEntries(guides.map((a) => [a.id, a.title]))));
  }, [id]);
  if (g === undefined) return <main><p>{t('app.loading')}</p></main>;
  if (g === null) return <main><p>{t('guide.notFound')}</p></main>;
  return (
    <main class="stack">
      <div class="row">
        <h1 style="flex:1">{g.title}</h1>
        <FavButton id={g.id} />
      </div>
      {isFallback('nav.home') && <p class="danger-box">{t('lang.fallback')}</p>}
      <p>{g.summary}</p>
      <p class="muted">
        {g.vital && <span class="badge">{t('guide.vital')}</span>}{' '}
        {g.minutes > 0 && <span>{t('common.minutes', { n: g.minutes })}</span>}{' '}
        {g.difficulty && <span>· {t('guide.level', { n: g.difficulty })}</span>}
      </p>
      <ReviewSeal g={g} />
      {g.status === 'draft' && <p class="danger-box">{t('guide.draft')}</p>}
      {g.warning && <div class="danger-box" role="alert"><strong>{t('guide.warning')}: </strong>{g.warning}</div>}
      <section class="card">
        <h2>{t('guide.now')}</h2>
        {g.now.length ? <ol class="steps">{g.now.map((s) => <li>{s}</li>)}</ol> : <p class="muted">{t('guide.empty')}</p>}
      </section>
      {g.understand.length > 0 && <section><h2>{t('guide.understand')}</h2><ul>{g.understand.map((s) => <li>{s}</li>)}</ul></section>}
      {g.mistakes.length > 0 && <section><h2>{t('guide.mistakes')}</h2><ul>{g.mistakes.map((s) => <li>{s}</li>)}</ul></section>}
      {g.materials.length > 0 && <section><h2>{t('guide.needs')}</h2><p>{g.materials.join(', ')}</p></section>}
      {g.related.length > 0 && (
        <section><h2>{t('guide.related')}</h2>
          <ul class="list">{g.related.map((r) => <li><a class="btn" href={href('guide', r)}>{titles[r] ?? r}</a></li>)}</ul>
        </section>
      )}
      <p class="muted">{t('review.disclaimer')}</p>
    </main>
  );
}
