import { useEffect, useState } from 'preact/hooks';
import { t } from '../../i18n';
import { updateSettings, useSettings } from '../../db/settings';
import { moon, nextMoonEvent, season, sunTimes } from '../../lib/astro';
import { partsIn } from '../../lib/clock';
import { fmt, regionName, tzOf, useNow } from './shared';

export function SunMoon() {
  const s = useSettings();
  const now = useNow(60000);
  const [countries, setCountries] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);
  useEffect(() => { import('../../generated/countries.json').then((m: any) => setCountries(m.default)); }, []);
  const loc = s.loc ?? { lat: 0, lon: 0 };
  const tz = tzOf(s);
  const p = partsIn(now, tz);
  const sun = sunTimes(p.year, p.month, p.day, loc.lat, loc.lon);
  const mn = moon(new Date(now));
  const time = (d: Date | null) => (d ? fmt(s.locale, d, { timeZone: tz, timeStyle: 'short', hour12: s.hour12 }) : '—');
  const gps = () => {
    setBusy(true);
    navigator.geolocation?.getCurrentPosition((r) => { updateSettings({ loc: { lat: +r.coords.latitude.toFixed(3), lon: +r.coords.longitude.toFixed(3) } }); setBusy(false); }, () => setBusy(false));
  };
  const num = (v: number, k: 'lat' | 'lon') => { const x = Number(v); if (Number.isFinite(x)) updateSettings({ loc: { ...loc, [k]: Math.max(k === 'lat' ? -90 : -180, Math.min(k === 'lat' ? 90 : 180, x)) } }); };
  const dl = sun.dayLengthMin;
  return (
    <main class="stack">
      <h1>{t('world.sun')}</h1>
      <section class="card stack">
        <div class="row">
          <label>{t('gps.lat')} <input type="number" step="0.01" value={loc.lat} onChange={(e) => num(+(e.target as HTMLInputElement).value, 'lat')} /></label>
          <label>{t('gps.lon')} <input type="number" step="0.01" value={loc.lon} onChange={(e) => num(+(e.target as HTMLInputElement).value, 'lon')} /></label>
        </div>
        <div class="row">
          <button onClick={gps} disabled={busy}>{busy ? t('gps.locating') : t('sun.usegps')}</button>
          <select aria-label={t('num.country')} onChange={(e) => { const c = countries.find((x) => x.cca2 === (e.target as HTMLSelectElement).value); if (c?.latlng) updateSettings({ loc: { lat: c.latlng[0], lon: c.latlng[1] } }); }}>
            <option value="">{t('sun.fromcountry')}</option>
            {[...countries].sort((a, b) => regionName(a.cca2, s.locale).localeCompare(regionName(b.cca2, s.locale), s.locale)).map((c) => <option value={c.cca2}>{regionName(c.cca2, s.locale)}</option>)}
          </select>
        </div>
        <p class="muted">{t('sun.note', { tz })}</p>
      </section>
      <section class="card">
        <h2>{t('sun.sun')}</h2>
        {sun.polar && <p>{t(sun.polar === 'day' ? 'sun.polarday' : 'sun.polarnight')}</p>}
        <ul class="list">
          <li>{t('sun.dawn')}: {time(sun.civilDawn)}</li><li>{t('sun.rise')}: {time(sun.sunrise)}</li><li>{t('sun.noon')}: {time(sun.solarNoon)}</li>
          <li>{t('sun.set')}: {time(sun.sunset)}</li><li>{t('sun.dusk')}: {time(sun.civilDusk)}</li>
          {dl !== null && <li>{t('sun.length')}: {Math.floor(dl / 60)} h {Math.round(dl % 60)} min</li>}
          <li>{t('clock.season')}: {t(`season.${season(new Date(now), loc.lat)}`)}</li>
        </ul>
      </section>
      <section class="card">
        <h2>{t('sun.moon')}</h2>
        <div class="big-num">{t(`moon.${mn.name}`)}</div>
        <ul class="list">
          <li>{t('moon.illum')}: {Math.round(mn.illumination * 100)}%</li><li>{t('moon.age', { d: mn.age.toFixed(1) })}</li>
          <li>{t('moon.nextfull')}: {fmt(s.locale, nextMoonEvent(new Date(now), 0.5), { dateStyle: 'medium', timeZone: tz })}</li>
          <li>{t('moon.nextnew')}: {fmt(s.locale, nextMoonEvent(new Date(now), 0), { dateStyle: 'medium', timeZone: tz })}</li>
        </ul>
        <p class="muted">{t('moon.approx')}</p>
      </section>
    </main>
  );
}
