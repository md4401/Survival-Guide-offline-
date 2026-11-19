import { useEffect, useMemo, useState } from 'preact/hooks';
import { t } from '../../i18n';
import { useSettings } from '../../db/settings';
import { POLAR_CIRCLE, TROPIC } from '../../data/climateZones';
import { regionName } from './shared';

export function WorldNumbers() {
  const s = useSettings();
  const [all, setAll] = useState<any[]>([]);
  useEffect(() => { import('../../generated/countries.json').then((m: any) => setAll(m.default)); }, []);
  const nf = new Intl.NumberFormat(s.locale);
  const d = useMemo(() => {
    const ind = all.filter((c) => c.independent);
    const byArea = [...ind].filter((c) => c.area > 0).sort((a, b) => b.area - a.area);
    const byPop = [...ind].filter((c) => c.population).sort((a, b) => b.population - a.population);
    const regions = ['Africa', 'Americas', 'Asia', 'Europe', 'Oceania'].map((r) => [r, all.filter((c) => c.region === r).length] as const);
    return { n: all.length, ind: ind.length, regions, big: byArea.slice(0, 5), small: byArea.slice(-5).reverse(), pop: byPop.slice(0, 5), landlocked: ind.filter((c) => c.landlocked).length };
  }, [all]);
  const name = (c: any) => regionName(c.cca2, s.locale);
  const list = (rows: any[], f: (c: any) => string) => <ol>{rows.map((c) => <li>{name(c)}: {f(c)}</li>)}</ol>;
  return (
    <main class="stack">
      <h1>{t('wn.title')}</h1>
      <p class="muted">{t('wn.source')}</p>
      <section class="card"><h2>{t('wn.countries')}</h2><ul class="list"><li>{t('wn.total', { n: d.n })}</li><li>{t('wn.independent', { n: d.ind })}</li><li>{t('wn.landlocked', { n: d.landlocked })}</li></ul>
        <ul>{d.regions.map(([r, n]) => <li>{t(`region.${r}`)}: {n}</li>)}</ul></section>
      <section class="card"><h2>{t('wn.largest')}</h2>{list(d.big, (c) => `${nf.format(c.area)} km²`)}</section>
      <section class="card"><h2>{t('wn.smallest')}</h2>{list(d.small, (c) => `${nf.format(c.area)} km²`)}</section>
      <section class="card"><h2>{t('wn.populous')}</h2>{list(d.pop, (c) => nf.format(c.population))}</section>
      <section class="card"><h2>{t('wn.lines')}</h2>
        <ul class="list"><li>{t('wn.equator')}: 0°</li><li>{t('wn.tropics')}: ±{TROPIC}°</li><li>{t('wn.polar')}: ±{POLAR_CIRCLE}°</li></ul></section>
    </main>
  );
}
