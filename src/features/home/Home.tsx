import { t } from '../../i18n';
import { href } from '../../router';
import { useEffect, useState } from 'preact/hooks';
import { loadGuides } from '../../content/loader';
import { useUserLists } from '../guides/Search';
import { useSettings } from '../../db/settings';
import type { Guide } from '../../content/types';

export function Home() {
  const st = useSettings();
  const { favs } = useUserLists();
  const [guides, setGuides] = useState<Guide[]>([]);
  useEffect(() => { loadGuides().then((r) => setGuides(r.guides)); }, [st.locale, st.dev]);
  const pinned = favs.slice(0, 6).map((id) => guides.find((g) => g.id === id)).filter(Boolean) as Guide[];
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
      {pinned.length > 0 && <><h2>{t('fav.title')}</h2><ul class="list">{pinned.map((g) => <li><a class="btn" href={href('guide', g.id)}>{g.title}</a></li>)}</ul></>}
    </main>
  );
}
