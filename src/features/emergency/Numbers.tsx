import emergency from '../../generated/emergency.json';
import { t } from '../../i18n';
import { getSettings, updateSettings, useSettings } from '../../db/settings';

type Entry = { numbers: Record<string, string>; source: 'spec' | 'community' };
const DB = emergency as Record<string, Entry>;
export const COUNTRY_CODES = Object.keys(DB);
const KINDS = ['general', 'police', 'ambulance', 'fire', 'civil', 'mental'] as const;

export function regionName(code: string, locale: string): string {
  try { return new Intl.DisplayNames([locale], { type: 'region' }).of(code) ?? code; } catch { return code; }
}
export function defaultCountry(locale: string): string { return locale === 'pt' && DB.BR ? 'BR' : DB.US ? 'US' : COUNTRY_CODES[0]; }

export function NumbersList() {
  const s = useSettings();
  const country = s.country || defaultCountry(s.locale);
  const entry = DB[country];
  const names = new Map(COUNTRY_CODES.map((c) => [c, regionName(c, getSettings().locale)] as const));
  const codes = [...COUNTRY_CODES].sort((a, b) => names.get(a)!.localeCompare(names.get(b)!, s.locale));
  return (
    <section class="stack">
      <h1>{t('num.title')}</h1>
      <label class="row">
        <span>{t('num.country')}</span>
        <select value={country} onChange={(e) => updateSettings({ country: (e.target as HTMLSelectElement).value })}>
          {codes.map((c) => <option value={c}>{names.get(c)}</option>)}
        </select>
      </label>
      {entry ? KINDS.filter((k) => entry.numbers[k]).map((k) => (
        <a class="btn card row" href={`tel:${entry.numbers[k]}`}>
          <span style="flex:1">{t(`num.${k}`)}</span><span class="big-num">{entry.numbers[k]}</span><span>{t('num.call')}</span>
        </a>
      )) : <p>{t('num.unknown')}</p>}
      <p class="muted">{entry?.source === 'spec' ? t('num.review') : t('num.unverified')}</p>
    </section>
  );
}
export const Numbers = () => <main><NumbersList /></main>;
