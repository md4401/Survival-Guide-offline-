import { useEffect, useMemo, useState } from 'preact/hooks';
import { t } from '../../i18n';
import { useSettings } from '../../db/settings';
import { GROUP_COLOR, groupOf, type Group } from '../../lib/koppen';
import { regionName } from './shared';

export function ClimateMap() {
  const s = useSettings();
  const [clim, setClim] = useState<any>(null);
  const [group, setGroup] = useState('');
  useEffect(() => { import('../../generated/climate.json').then((m: any) => setClim(m.default)); }, []);
  const groups: Group[] = ['A', 'B', 'C', 'D', 'E'];
  const pts = useMemo(() => (clim?.cities ?? []).filter((c: any) => !group || groupOf(c[5]) === group), [clim, group]);
  const counts = groups.map((g) => [g, (clim?.cities ?? []).filter((c: any) => groupOf(c[5]) === g).length] as const);
  const y = (lat: number) => 90 - lat;
  return (
    <main class="stack">
      <h1>{t('cmap.title')}</h1>
      <p class="muted">{t('cmap.approx')}</p>
      <select value={group} onChange={(e) => setGroup((e.target as HTMLSelectElement).value)} aria-label={t('zones.title')}>
        <option value="">{t('countries.all')}</option>{groups.map((g) => <option value={g}>{t(`kg.${g}`)}</option>)}
      </select>
      <svg viewBox="0 0 360 180" role="img" aria-label={t('cmap.title')} style="inline-size:100%;background:var(--surface);border:1px solid var(--border);border-radius:12px" dir="ltr">
        {[23.44, -23.44, 66.56, -66.56, 0].map((l) => <line x1="0" x2="360" y1={y(l)} y2={y(l)} stroke="var(--border)" stroke-dasharray={l === 0 ? '0' : '3 3'} />)}
        {pts.map((c: any) => <circle cx={c[3] + 180} cy={y(c[2])} r="1.4" fill={GROUP_COLOR[groupOf(c[5])!]}><title>{`${c[0]}, ${regionName(c[1], s.locale)} · ${c[5]}`}</title></circle>)}
      </svg>
      <ul class="list card">{counts.map(([g, n]) => <li class="row"><span style={`inline-size:1rem;block-size:1rem;border-radius:50%;background:${GROUP_COLOR[g]}`} /><span style="flex:1">{t(`kg.${g}`)}</span><strong>{n}</strong></li>)}</ul>
      <p class="muted">{t('kopp.source')}</p>
    </main>
  );
}
