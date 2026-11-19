import { useEffect, useState } from 'preact/hooks';
import { t } from '../../i18n';
import { href } from '../../router';
import { useSettings } from '../../db/settings';
import { db } from '../../db/dexie';
import { season } from '../../lib/astro';
import { suggest } from '../../lib/suggest';
import { waterNeed } from '../../lib/water';
import { plan, checkKey } from '../../data/kits';
import { SCENARIO_GUIDE, type ScenarioKey } from '../../lib/crisis';

export function Plan72() {
  const s = useSettings(); const p = s.profile; const [done, setDone] = useState<Set<string>>(new Set());
  useEffect(() => { db.checklists.toArray().then((r) => setDone(new Set(r.filter((x) => x.done).map((x) => x.key)))).catch(() => {}); }, []);
  const sug = suggest({ season: s.loc ? season(new Date(), s.loc.lat) : null, home: p.home, kids: p.kids, elderly: p.elderly, pets: p.pets });
  const items = plan('72h', { people: p.people, days: 3, kids: p.kids, elderly: p.elderly, pets: p.pets });
  const water = waterNeed({ people: p.people, kids: p.kids, pets: p.pets, days: 3, hot: false, hardWork: false });
  const meals = items.find((x) => x.item.id === 'food')?.qty ?? p.people * 9;
  const missing = items.filter((x) => !done.has(checkKey('72h', x.item.id))).slice(0, 5);
  return (
    <main class="stack"><h1>{t('plan72.title')}</h1><p class="muted">{t('plan72.intro')}</p>
      <section class="card stack"><h2>{t('plan72.scen')}</h2><ul class="list">{sug.map((x) => <li><a class="btn" href={href('guide', SCENARIO_GUIDE[x.scenario as ScenarioKey])}><span style="flex:1">{t(`scenario.${x.scenario}`)}</span><span class="muted">{t('suggest.why')}: {t(x.reason)}</span></a></li>)}</ul></section>
      <section class="card stack"><h2>{t('plan72.kit')}</h2><p>{t('plan72.kit.line', { p: p.people, w: water, m: meals })}</p><p class="muted">{t('kit.review')}</p></section>
      <section class="card stack"><h2>{t('plan72.buy')}</h2>{missing.length === 0 ? <p class="muted">{t('plan72.empty')}</p> : <ul class="list">{missing.map((x) => <li class="row"><span style="flex:1">{t(`kit.item.${x.item.id}`)} · {x.qty} {t(`kit.unit.${x.item.unit ?? 'pcs'}`)}</span><span class="muted">{x.item.when ? t(`kit.why.${x.item.when}`) : t('plan72.buy.why')}</span></li>)}</ul>}
        <a class="btn" href={href('prepare', 'kit', '72h')}>{t('kit.title.72h')}</a></section>
      <section class="card stack"><h2>{t('plan72.actions')}</h2>
        <a class="btn" href={href('numbers')}>📞 {t('plan72.a.numbers')}</a><a class="btn" href={href('prepare', 'family')}>👪 {t('plan72.a.family')}</a>
        <a class="btn" href={href('prepare', 'water')}>💧 {t('plan72.a.water')}</a><a class="btn" href={href('triage')}>🆘 {t('plan72.a.triage')}</a></section>
    </main>
  );
}
