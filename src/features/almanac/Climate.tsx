import { useState } from 'preact/hooks';
import data from '../../data/climate.json';
import { t } from '../../i18n';
import { useSettings } from '../../db/settings';
import { fmt } from './shared';

export function Climate() {
  const s = useSettings();
  const [a, setA] = useState(data.cities[0].id);
  const [b, setB] = useState('');
  const cities = data.cities;
  const conv = (c: number) => (s.units === 'imperial' ? Math.round(c * 1.8 + 32) : c);
  const unit = s.units === 'imperial' ? '°F' : '°C';
  const row = (id: string) => cities.find((c) => c.id === id);
  const months = Array.from({ length: 12 }, (_, i) => fmt(s.locale, Date.UTC(2023, i, 15), { month: 'short', timeZone: 'UTC' }));
  const sel = (v: string, on: (x: string) => void, blank?: string) => (
    <select value={v} onChange={(e) => on((e.target as HTMLSelectElement).value)}>{blank && <option value="">{blank}</option>}{cities.map((c) => <option value={c.id}>{c.name}</option>)}</select>
  );
  const A = row(a)!, B = row(b);
  return (
    <main class="stack">
      <h1>{t('world.climate')}</h1>
      <p class="danger-box">{t('climate.sample')}</p>
      <div class="row">{sel(a, setA)}{sel(b, setB, t('climate.compare'))}</div>
      <table class="cal">
        <thead><tr><th>{t('climate.month')}</th><th>{A.name}</th>{B && <th>{B.name}</th>}</tr></thead>
        <tbody>{months.map((m, i) => <tr><td>{m}</td><td>{conv(A.tempC[i])}{unit}</td>{B && <td>{conv(B.tempC[i])}{unit}</td>}</tr>)}</tbody>
      </table>
    </main>
  );
}
