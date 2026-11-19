import { useEffect, useMemo, useState } from 'preact/hooks';
import { t } from '../../i18n';
import { useSettings } from '../../db/settings';
import { BANDS, BAND_COLOR, bandFor, POLAR_CIRCLE, TROPIC } from '../../data/climateZones';
import { regionName } from './shared';

export function ClimateMap() {
  const s = useSettings();
  const [all, setAll] = useState<any[]>([]);
  const [region, setRegion] = useState('');
  useEffect(() => { import('../../generated/countries.json').then((m: any) => setAll(m.default)); }, []);
  const pts = useMemo(() => all.filter((c) => c.latlng?.length === 2 && (!region || c.region === region)), [all, region]);
  const counts = BANDS.map((b) => [b, pts.filter((c) => bandFor(c.latlng[0]) === b).length] as const);
  const y = (lat: number) => 90 - lat;
  return (
    <main class="stack">
      <h1>{t('cmap.title')}</h1>
      <p class="danger-box">{t('cmap.approx')}</p>
      <select value={region} onChange={(e) => setRegion((e.target as HTMLSelectElement).value)} aria-label={t('countries.region')}>
        <option value="">{t('countries.all')}</option>
        {['Africa', 'Americas', 'Asia', 'Europe', 'Oceania'].map((r) => <option value={r}>{t(`region.${r}`)}</option>)}
      </select>
      <svg viewBox="0 0 360 180" role="img" aria-label={t('cmap.title')} style="inline-size:100%;background:var(--surface);border:1px solid var(--border);border-radius:12px" dir="ltr">
        {[TROPIC, -TROPIC, POLAR_CIRCLE, -POLAR_CIRCLE, 0].map((l) => <line x1="0" x2="360" y1={y(l)} y2={y(l)} stroke="var(--border)" stroke-dasharray={l === 0 ? '0' : '3 3'} />)}
        {pts.map((c) => <circle cx={c.latlng[1] + 180} cy={y(c.latlng[0])} r="1.6" fill={BAND_COLOR[bandFor(c.latlng[0])]}><title>{regionName(c.cca2, s.locale)}</title></circle>)}
      </svg>
      <ul class="list card">{counts.map(([b, n]) => <li class="row"><span style={`inline-size:1rem;block-size:1rem;border-radius:50%;background:${BAND_COLOR[b]}`} /><span style="flex:1">{t(`band.${b}`)}</span><strong>{n}</strong></li>)}</ul>
    </main>
  );
}
