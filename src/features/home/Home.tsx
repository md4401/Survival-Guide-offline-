import { t } from '../../i18n';
import { href } from '../../router';
import { useEffect, useState } from 'preact/hooks';
import { loadGuides } from '../../content/loader';
import { useUserLists } from '../guides/Search';
import { useSettings } from '../../db/settings';
import type { Guide } from '../../content/types';
import { getKV } from '../../db/dexie';
import { loadAi } from '../../ai/manager';
import { dayNumber } from '../../lib/clock';
import { season } from '../../lib/astro';
import { suggest } from '../../lib/suggest';
import { SCENARIO_GUIDE, type CrisisState, type ScenarioKey } from '../../lib/crisis';

export function Home() {
  const st = useSettings();
  const { favs } = useUserLists();
  const [guides, setGuides] = useState<Guide[]>([]);
  useEffect(() => { loadGuides().then((r) => setGuides(r.guides)); }, [st.locale, st.dev]);
  const [crisis, setCrisis] = useState<CrisisState | null>(null);
  useEffect(() => { getKV<CrisisState | null>('crisis', null).then(setCrisis); }, []);
  const [hasAi, setHasAi] = useState(false);
  useEffect(() => { loadAi().then((a) => setHasAi(!!a.active)); }, []);
  const sug = suggest({ season: st.loc ? season(new Date(), st.loc.lat) : null, home: st.profile.home, kids: st.profile.kids, elderly: st.profile.elderly, pets: st.profile.pets });
  const pinned = favs.slice(0, 6).map((id) => guides.find((g) => g.id === id)).filter(Boolean) as Guide[];
  return (
    <main class="stack">
      <a class="btn btn-danger btn-block help-btn" href={href('triage')}>{t('home.help')}</a>
      <a class="btn btn-block" href={href('crisis')}>{crisis ? `${t('crisis.active')}: ${t('counter.day', { n: dayNumber(crisis.start, Date.now()) })}` : t('crisis.living')}</a>
      <p class="muted">{t('home.tagline')}</p>
      {!st.onboarded && <a class="btn card" href={href('onboarding')}>{t('onb.banner')}</a>}
      <h2>{t('home.tools')}</h2>
      <div class="grid2">
        <a class="btn tool" href={href('torch')}>🔦 {t('home.torch')}</a>
        <a class="btn tool" href={href('whistle')}>📣 {t('home.whistle')}</a>
        <a class="btn tool" href={href('torch')}>🆘 {t('home.sos')}</a>
        <a class="btn tool" href={href('numbers')}>📞 {t('home.numbers')}</a>
        <a class="btn tool" href={href('gps')}>📍 {t('home.gps')}</a>
        {hasAi && <a class="btn tool" href={href('assistant')}>🤖 {t('ai.title')}</a>}
      </div>
      {(st.onboarded || st.loc) && <><h2>{t('suggest.title')}</h2><ul class="list">{sug.map((x) => <li><a class="btn" href={href('guide', SCENARIO_GUIDE[x.scenario as ScenarioKey])}><span style="flex:1">{t(`scenario.${x.scenario}`)}</span><span class="muted">{t('suggest.why')}: {t(x.reason)}</span></a></li>)}</ul></>}
      {pinned.length > 0 && <><h2>{t('fav.title')}</h2><ul class="list">{pinned.map((g) => <li><a class="btn" href={href('guide', g.id)}>{g.title}</a></li>)}</ul></>}
    </main>
  );
}
