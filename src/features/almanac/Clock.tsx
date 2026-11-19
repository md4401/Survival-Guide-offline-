import { t } from '../../i18n';
import { updateSettings, useSettings } from '../../db/settings';
import { dayOfYear, isLeap, isoWeek, partsIn, quarter } from '../../lib/clock';
import { season } from '../../lib/astro';
import { allTimeZones, deviceTz, fmt, tzOf, useNow } from './shared';

export function Clock() {
  const s = useSettings();
  const now = useNow();
  const tz = tzOf(s);
  const p = partsIn(now, tz);
  const wk = isoWeek(p.year, p.month, p.day);
  const lat = s.loc?.lat ?? 0;
  const adj = (ms: number) => updateSettings({ clockOffsetMs: s.clockOffsetMs + ms });
  return (
    <main class="stack">
      <h1>{t('world.clock')}</h1>
      <div class="card">
        <div class="big-num" aria-live="off">{fmt(s.locale, now, { timeZone: tz, timeStyle: 'medium', hour12: s.hour12 })}</div>
        <div>{fmt(s.locale, now, { timeZone: tz, dateStyle: 'full' })}</div>
      </div>
      <ul class="list card">
        <li>{t('clock.doy')}: {dayOfYear(p.year, p.month, p.day)}</li>
        <li>{t('clock.week')}: {wk.week}</li>
        <li>{t('clock.quarter')}: {quarter(p.month)}</li>
        <li>{t('clock.leap')}: {isLeap(p.year) ? t('common.yes') : t('common.no')}</li>
        <li>{t('clock.season')}: {t(`season.${season(new Date(now), lat)}`)}</li>
      </ul>
      <label class="row"><span>{t('clock.tz')}</span>
        <select value={tzOf(s)} onChange={(e) => updateSettings({ tz: (e.target as HTMLSelectElement).value === deviceTz() ? '' : (e.target as HTMLSelectElement).value })}>
          {[...new Set([deviceTz(), ...allTimeZones()])].map((z) => <option value={z}>{z}</option>)}
        </select>
      </label>
      <section class="card stack">
        <h2>{t('clock.adjust')}</h2>
        <p class="muted">{t('clock.adjust.hint')}</p>
        <div class="row">
          <button onClick={() => adj(-3600000)}>-1 h</button><button onClick={() => adj(-60000)}>-1 min</button>
          <button onClick={() => adj(60000)}>+1 min</button><button onClick={() => adj(3600000)}>+1 h</button>
          <button onClick={() => updateSettings({ clockOffsetMs: 0 })}>{t('clock.reset')}</button>
        </div>
        <p class="muted">{t('clock.offset', { s: Math.round(s.clockOffsetMs / 1000) })}</p>
      </section>
    </main>
  );
}
