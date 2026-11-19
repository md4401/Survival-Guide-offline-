import { updateSettings, useSettings } from '../../db/settings';
import { ALL_LANGS, MVP_LANGS, t } from '../../i18n';
import type { Lang } from '../../content/types';

export function Settings() {
  const s = useSettings();
  const sel = (v: string, on: (x: string) => void, opts: Array<[string, string]>) => (
    <select value={v} onChange={(e) => on((e.target as HTMLSelectElement).value)}>{opts.map(([k, l]) => <option value={k}>{l}</option>)}</select>
  );
  return (
    <main class="stack">
      <h1>{t('settings.title')}</h1>
      <label class="row"><span>{t('settings.language')}</span>
        {sel(s.locale, (v) => updateSettings({ locale: v as Lang }), ALL_LANGS.map((l) => [l, t(`lang.${l}`) + (MVP_LANGS.includes(l as any) ? '' : ` (${t('settings.soon')})`)]))}
      </label>
      <label class="row"><span>{t('settings.theme')}</span>
        {sel(s.theme, (v) => updateSettings({ theme: v as any }), [['dark', t('settings.theme.dark')], ['light', t('settings.theme.light')], ['red', t('settings.theme.red')]])}
      </label>
      <label class="row"><span>{t('settings.font')}</span>
        <input type="range" min="0.9" max="1.6" step="0.1" value={s.fontScale} onInput={(e) => updateSettings({ fontScale: Number((e.target as HTMLInputElement).value) })} />
      </label>
      <label class="row"><span>{t('settings.units')}</span>
        {sel(s.units, (v) => updateSettings({ units: v as any }), [['metric', t('settings.units.metric')], ['imperial', t('settings.units.imperial')]])}
      </label>
      <label class="row"><input type="checkbox" checked={s.hour12} onChange={(e) => updateSettings({ hour12: (e.target as HTMLInputElement).checked })} /><span>{t('settings.hour12')}</span></label>
      <label class="row"><input type="checkbox" checked={s.battery} onChange={(e) => updateSettings({ battery: (e.target as HTMLInputElement).checked })} /><span>{t('settings.battery')}</span></label>
      <label class="row"><input type="checkbox" checked={s.dev} onChange={(e) => updateSettings({ dev: (e.target as HTMLInputElement).checked })} /><span>{t('settings.dev')}</span></label>
      <p class="muted">{t('settings.privacy')}</p>
    </main>
  );
}
