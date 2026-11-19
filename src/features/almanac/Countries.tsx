import { useEffect, useMemo, useState } from 'preact/hooks';
import { t } from '../../i18n';
import { useSettings } from '../../db/settings';
import { regionName } from './shared';

interface C { cca2: string; cca3: string; region: string; subregion: string; capital: string | null; area: number; languages: string[]; currencies: string[]; borders: string[]; callingCode: string; name: string }
const dn = (type: 'language' | 'currency', code: string, locale: string) => { try { return new Intl.DisplayNames([locale], { type }).of(code) ?? code; } catch { return code; } };

export function Countries() {
  const s = useSettings();
  const [all, setAll] = useState<C[]>([]);
  const [q, setQ] = useState('');
  const [region, setRegion] = useState('');
  useEffect(() => { import('../../generated/countries.json').then((m: any) => setAll(m.default)); }, []);
  const by3 = useMemo(() => new Map(all.map((c) => [c.cca3, c])), [all]);
  const nm = (c: C) => regionName(c.cca2, s.locale);
  const list = useMemo(() => {
    const n = q.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    return all.filter((c) => (!region || c.region === region) && (!n || (nm(c) + ' ' + c.name).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').includes(n)))
      .sort((a, b) => nm(a).localeCompare(nm(b), s.locale));
  }, [all, q, region, s.locale]);
  const nf = new Intl.NumberFormat(s.locale);
  return (
    <main class="stack">
      <h1>{t('world.countries')}</h1>
      <p class="muted">{t('countries.count', { n: list.length })}</p>
      <input type="search" value={q} onInput={(e) => setQ((e.target as HTMLInputElement).value)} placeholder={t('common.search')} aria-label={t('common.search')} />
      <select value={region} onChange={(e) => setRegion((e.target as HTMLSelectElement).value)} aria-label={t('countries.region')}>
        <option value="">{t('countries.all')}</option>
        {['Africa', 'Americas', 'Asia', 'Europe', 'Oceania', 'Antarctic'].map((r) => <option value={r}>{t(`region.${r}`)}</option>)}
      </select>
      {list.map((c) => (
        <details class="card">
          <summary>{nm(c)}</summary>
          <ul class="list">
            <li>{t('countries.capital')}: {c.capital ?? '—'}</li>
            <li>{t('countries.region')}: {t(`region.${c.region}`)}{c.subregion ? ` · ${c.subregion}` : ''}</li>
            <li>{t('countries.area')}: {c.area ? `${nf.format(c.area)} km²` : '—'}</li>
            <li>{t('countries.languages')}: {c.languages.map((l) => dn('language', l, s.locale)).join(', ') || '—'}</li>
            <li>{t('countries.currency')}: {c.currencies.map((x) => `${dn('currency', x, s.locale)} (${x})`).join(', ') || '—'}</li>
            <li>{t('countries.phone')}: {c.callingCode || '—'}</li>
            <li>{t('countries.borders')}: {c.borders.map((b) => (by3.get(b) ? nm(by3.get(b)!) : b)).join(', ') || '—'}</li>
          </ul>
        </details>
      ))}
      <p class="muted">{t('countries.source')}</p>
    </main>
  );
}
