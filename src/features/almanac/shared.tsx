import { useEffect, useState } from 'preact/hooks';
import { getSettings, useSettings } from '../../db/settings';
import { nowMs } from '../../lib/clock';

/** Ticks every second; honours the manual clock offset. */
export function useNow(intervalMs = 1000): number {
  const s = useSettings();
  const [n, setN] = useState(nowMs(s.clockOffsetMs));
  useEffect(() => { const id = setInterval(() => setN(nowMs(getSettings().clockOffsetMs)), intervalMs); return () => clearInterval(id); }, [intervalMs]);
  return n;
}
export const deviceTz = () => Intl.DateTimeFormat().resolvedOptions().timeZone;
export const tzOf = (s: { tz: string }) => s.tz || deviceTz();
export function allTimeZones(): string[] {
  try { return (Intl as any).supportedValuesOf('timeZone') as string[]; } catch { return [deviceTz(), 'UTC']; }
}
export const fmt = (locale: string, ms: number | Date, opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(locale, opts).format(ms);
export const regionName = (code: string, locale: string) => { try { return new Intl.DisplayNames([locale], { type: 'region' }).of(code) ?? code; } catch { return code; } };
export const ReviewBanner = ({ k }: { k: string }) => <p class="danger-box" role="note">{k}</p>;
