import { useEffect, useMemo, useState } from 'preact/hooks';
import { loadGuides } from '../../content/loader';
import { buildIndex, search } from '../../search';
import type { Guide } from '../../content/types';
import { t } from '../../i18n';
import { href } from '../../router';
import { db } from '../../db/dexie';
import { useSettings } from '../../db/settings';

export function useUserLists() {
  const [favs, setFavs] = useState<string[]>([]);
  const [hist, setHist] = useState<string[]>([]);
  useEffect(() => {
    db.favorites.orderBy('at').reverse().toArray().then((a) => setFavs(a.map((x) => x.id))).catch(() => {});
    db.history.orderBy('at').reverse().limit(6).toArray().then((a) => setHist(a.map((x) => x.id))).catch(() => {});
  }, []);
  return { favs, hist };
}

export function Search() {
  const s = useSettings();
  const [guides, setGuides] = useState<Guide[]>([]);
  const [q, setQ] = useState('');
  const { favs, hist } = useUserLists();
  useEffect(() => { loadGuides().then((r) => setGuides(r.guides)); }, [s.locale, s.dev]);
  const index = useMemo(() => buildIndex(guides), [guides]);
  const hits = useMemo(() => search(index, s.locale, q), [index, q, s.locale]);
  const byId = new Map(guides.map((g) => [g.id, g]));
  const list = (ids: string[]) => ids.filter((i) => byId.has(i)).map((i) => <li><a class="btn" href={href('guide', i)}>{byId.get(i)!.title}</a></li>);
  return (
    <main class="stack">
      <h1>{t('search.title')}</h1>
      <input type="search" value={q} onInput={(e) => setQ((e.target as HTMLInputElement).value)} placeholder={t('search.placeholder')} aria-label={t('search.title')} autofocus />
      {q.trim() ? (
        hits.length ? <ul class="list">{hits.map((h) => <li><a class="btn" href={href('guide', h.id)}>{h.title}</a></li>)}</ul> : <p class="muted">{t('search.none')}</p>
      ) : (
        <>
          {favs.length > 0 && <><h2>{t('fav.title')}</h2><ul class="list">{list(favs)}</ul></>}
          {hist.length > 0 && <><h2>{t('hist.title')}</h2><ul class="list">{list(hist)}</ul></>}
        </>
      )}
    </main>
  );
}
