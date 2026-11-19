// Optional 5-day forecast from Open-Meteo (free, no key). Network is used ONLY after explicit consent, never in Crisis Mode,
// and the last result is cached on the device so it can be read offline. Only latitude/longitude are sent.
import { getKV, setKV } from '../db/dexie';

export interface Day { date: string; max: number; min: number; rain: number; code: number }
export interface Forecast { fetchedAt: number; lat: number; lon: number; days: Day[] }
export const forecastUrl = (lat: number, lon: number) => `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(2)}&longitude=${lon.toFixed(2)}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode&forecast_days=5&timezone=auto`;
export function parseForecast(j: any, lat: number, lon: number, now: number): Forecast | null {
  const d = j?.daily; if (!d || !Array.isArray(d.time)) return null;
  const days: Day[] = d.time.map((date: string, i: number) => ({ date, max: Number(d.temperature_2m_max?.[i]), min: Number(d.temperature_2m_min?.[i]), rain: Number(d.precipitation_sum?.[i] ?? 0), code: Number(d.weathercode?.[i] ?? 0) }));
  return days.length && days.every((x) => Number.isFinite(x.max) && Number.isFinite(x.min)) ? { fetchedAt: now, lat, lon, days } : null;
}
/** WMO weather code → i18n key suffix. */
export function codeKey(c: number): string {
  if (c === 0) return 'clear'; if (c <= 3) return 'cloudy'; if (c === 45 || c === 48) return 'fog'; if (c >= 51 && c <= 57) return 'drizzle';
  if ((c >= 61 && c <= 67) || (c >= 80 && c <= 82)) return 'rain'; if ((c >= 71 && c <= 77) || c === 85 || c === 86) return 'snow'; if (c >= 95) return 'storm'; return 'cloudy';
}
export const loadForecast = () => getKV<Forecast | null>('forecast', null);
export const ageHours = (f: Forecast, now = Date.now()) => Math.max(0, Math.round((now - f.fetchedAt) / 3600000));
export async function refreshForecast(o: { lat: number; lon: number; consent: boolean; online: boolean; crisis: boolean; fetchFn?: typeof fetch; now?: number }): Promise<Forecast | null> {
  if (!o.consent || !o.online || o.crisis) return null;
  try {
    const r = await (o.fetchFn ?? fetch)(forecastUrl(o.lat, o.lon)); if (!r.ok) return null;
    const f = parseForecast(await r.json(), o.lat, o.lon, o.now ?? Date.now()); if (f) await setKV('forecast', f); return f;
  } catch { return null; }
}
