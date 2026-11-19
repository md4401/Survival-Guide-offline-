import { useEffect, useMemo, useState } from 'preact/hooks';
import data from '../../data/climate.json';
import { t } from '../../i18n';
import { useSettings } from '../../db/settings';
import { decode, GROUP_COLOR } from '../../lib/koppen';
import { fmt, regionName } from './shared';

type City = [string, string, number, number, number, string, number];
export const koppenText = (code: string) => { const d = decode(code); return d ? d.keys.map((k) => t(k)).join(' · ') : code; };
export const KoppenBadge = ({ code }: { code: string }) => { const d = decode(code); return <span class="badge" style={`border-color:${d ? GROUP_COLOR[d.group] : 'var(--border)'}`}>{code}</span>; };

export function Climate() {
  const s = useSettings();
  const [clim, setClim] = useState<{ countries: Record<string, { c: string | null; classes: string[] }>; cities: City[] } | null>(null);
  const [q, setQ] = useState('');
  const [cc, setCc] = useState('');
  const [a, setA] = useState(data.cities[0].id); const [b, setB] = useState('');
  useEffect(() => { import('../../generated/climate.json').then((m: any) => setClim(m.default)); }, []);
  const norm = (x: string) => x.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const list = useMemo(() => {
    if (!clim) return [];
    const n = norm(q);
    return clim.cities.filter((c) => (!cc || c[1] === cc) && (!n || norm(c[0]).includes(n) || norm(regionName(c[1], s.locale)).includes(n))).sort((x, y) => y[4] - x[4]).slice(0, 80);
  }, [clim, q, cc, s.locale]);
  const codes = clim ? Object.keys(clim.countries).filter((k) => clim.countries[k].classes.length).sort((x, y) => regionName(x, s.locale).localeCompare(regionName(y, s.locale), s.locale)) : [];
  const nf = new Intl.NumberFormat(s.locale, { notation: 'compact' });
  // sample monthly temperatures (3 cities), unchanged and still unverified
  const conv = (c: number) => (s.units === 'imperial' ? Math.round(c * 1.8 + 32) : c);
  const unit = s.units === 'imperial' ? '°F' : '°C';
  const months = Array.from({ length: 12 }, (_, i) => fmt(s.locale, Date.UTC(2023, i, 15), { month: 'short', timeZone: 'UTC' }));
  const A = data.cities.find((c) => c.id === a)!, B = data.cities.find((c) => c.id === b);
  const sel = (v: string, on: (x: string) => void, blank?: string) => <select value={v} onChange={(e) => on((e.target as HTMLSelectElement).value)}>{blank && <option value="">{blank}</option>}{data.cities.map((c) => <option value={c.id}>{c.name}</option>)}</select>;
  return (
    <main class="stack">
      <h1>{t('world.climate')}</h1>
      <p class="muted">{t('kopp.hint')}</p>
      <div class="row">
        <input type="search" style="flex:1" value={q} onInput={(e) => setQ((e.target as HTMLInputElement).value)} placeholder={t('kopp.pick')} aria-label={t('kopp.pick')} />
        <select value={cc} onChange={(e) => setCc((e.target as HTMLSelectElement).value)} aria-label={t('num.country')}>
          <option value="">{t('countries.all')}</option>{codes.map((k) => <option value={k}>{regionName(k, s.locale)}</option>)}</select>
      </div>
      {!clim ? <p>{t('app.loading')}</p> : list.length === 0 ? <p class="muted">{t('search.none')}</p> : (
        <ul class="list">{list.map((c) => (
          <li class="card"><div class="row"><strong style="flex:1">{c[0]}{c[6] ? ' ★' : ''} <span class="muted">· {regionName(c[1], s.locale)}</span></strong><KoppenBadge code={c[5]} /></div>
            <div class="muted">{koppenText(c[5])} · {t('countries.population')}: {nf.format(c[4])}</div></li>))}
        </ul>
      )}
      <p class="muted">{t('kopp.source')}</p>
      <section class="card stack"><h2>{t('climate.monthly')}</h2>
        <p class="danger-box">{t('climate.sample')}</p>
        <div class="row">{sel(a, setA)}{sel(b, setB, t('climate.compare'))}</div>
        <table class="cal"><thead><tr><th>{t('climate.month')}</th><th>{A.name}</th>{B && <th>{B.name}</th>}</tr></thead>
          <tbody>{months.map((m, i) => <tr><td>{m}</td><td>{conv(A.tempC[i])}{unit}</td>{B && <td>{conv(B.tempC[i])}{unit}</td>}</tr>)}</tbody></table></section>
    </main>
  );
}
