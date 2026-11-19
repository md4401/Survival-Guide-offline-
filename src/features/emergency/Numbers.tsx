import data from '../../data/emergency-numbers.json';
import { t } from '../../i18n';
import { getSettings, updateSettings, useSettings } from '../../db/settings';

const codes = Object.keys(data.countries);
const KINDS = ['general', 'police', 'ambulance', 'fire', 'civil', 'mental'] as const;

function regionName(code: string, locale: string): string {
  try { return new Intl.DisplayNames([locale], { type: 'region' }).of(code) ?? code; } catch { return code; }
}

export function NumbersList() {
  const s = useSettings();
  const country = s.country || (codes.includes(s.locale === 'pt' ? 'BR' : 'US') ? (s.locale === 'pt' ? 'BR' : 'US') : codes[0]);
  const entry = (data.countries as Record<string, Record<string, string>>)[country];
  return (
    <section class="stack">
      <h1>{t('num.title')}</h1>
      <label class="row">
        <span>{t('num.country')}</span>
        <select value={country} onChange={(e) => updateSettings({ country: (e.target as HTMLSelectElement).value })}>
          {codes.map((c) => <option value={c}>{regionName(c, getSettings().locale)}</option>)}
        </select>
      </label>
      {entry ? KINDS.filter((k) => entry[k]).map((k) => (
        <a class="btn card row" href={`tel:${entry[k]}`}>
          <span style="flex:1">{t(`num.${k}`)}</span><span class="big-num">{entry[k]}</span><span>{t('num.call')}</span>
        </a>
      )) : <p>{t('num.unknown')}</p>}
      <p class="muted">{t('num.review')}</p>
    </section>
  );
}
export const Numbers = () => <main><NumbersList /></main>;
