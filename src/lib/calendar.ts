/** Gregorian Easter (anonymous/Meeus algorithm). Returns [month, day]. */
export function easter(y: number): [number, number] {
  const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4;
  const f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31), day = ((h + l - 7 * m + 114) % 31) + 1;
  return [month, day];
}
const addDays = (y: number, m: number, d: number, n: number): [number, number] => {
  const dt = new Date(Date.UTC(y, m - 1, d + n)); return [dt.getUTCMonth() + 1, dt.getUTCDate()];
};
export interface Holiday { month: number; day: number; key: string }

/** Brazilian national holidays + commonly observed moveable dates. Keys are i18n keys `holiday.*`. Needs official verification. */
export function holidaysBR(y: number): Holiday[] {
  const [em, ed] = easter(y);
  const mv = (n: number, key: string): Holiday => { const [m, d] = addDays(y, em, ed, n); return { month: m, day: d, key }; };
  const list: Holiday[] = [
    { month: 1, day: 1, key: 'holiday.newyear' }, { month: 4, day: 21, key: 'holiday.tiradentes' }, { month: 5, day: 1, key: 'holiday.labour' },
    { month: 9, day: 7, key: 'holiday.independence' }, { month: 10, day: 12, key: 'holiday.aparecida' }, { month: 11, day: 2, key: 'holiday.allsouls' },
    { month: 11, day: 15, key: 'holiday.republic' }, { month: 11, day: 20, key: 'holiday.blackconsciousness' }, { month: 12, day: 25, key: 'holiday.christmas' },
    mv(-48, 'holiday.carnival'), mv(-47, 'holiday.carnival'), mv(-2, 'holiday.goodfriday'), mv(0, 'holiday.easter'), mv(60, 'holiday.corpuschristi'),
  ];
  return list.sort((a, b) => a.month - b.month || a.day - b.day);
}

/** Month grid: array of weeks, each 7 cells (day number or null). `weekStart` 0=Sunday, 1=Monday. */
export function monthGrid(y: number, m: number, weekStart: 0 | 1 = 0): Array<Array<number | null>> {
  const first = new Date(Date.UTC(y, m - 1, 1)).getUTCDay();
  const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const offset = (first - weekStart + 7) % 7;
  const cells: Array<number | null> = [...Array(offset).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  while (cells.length % 7) cells.push(null);
  return Array.from({ length: cells.length / 7 }, (_, i) => cells.slice(i * 7, i * 7 + 7));
}

export type AltCalendar = 'islamic' | 'hebrew' | 'chinese' | 'persian';
/** Date text in another calendar via the device's Intl (no tables shipped). */
export function formatInCalendar(ms: number, cal: AltCalendar, locale: string, timeZone?: string): string {
  try { return new Intl.DateTimeFormat(`${locale}-u-ca-${cal}`, { dateStyle: 'long', timeZone }).format(new Date(ms)); } catch { return ''; }
}
