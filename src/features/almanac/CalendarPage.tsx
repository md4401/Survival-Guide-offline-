import { useState } from 'preact/hooks';
import { t } from '../../i18n';
import { useSettings } from '../../db/settings';
import { formatInCalendar, holidaysBR, monthGrid, type AltCalendar } from '../../lib/calendar';
import { partsIn } from '../../lib/clock';
import { fmt, tzOf, useNow } from './shared';

const ALT: AltCalendar[] = ['islamic', 'hebrew', 'chinese', 'persian'];
export function CalendarPage() {
  const s = useSettings();
  const now = useNow(60000);
  const p = partsIn(now, tzOf(s));
  const [ym, setYm] = useState<[number, number]>([p.year, p.month]);
  const [y, m] = ym;
  const shift = (n: number) => { const d = new Date(Date.UTC(y, m - 1 + n, 1)); setYm([d.getUTCFullYear(), d.getUTCMonth() + 1]); };
  const grid = monthGrid(y, m, 0);
  const hol = holidaysBR(y).filter((h) => h.month === m);
  const wd = Array.from({ length: 7 }, (_, i) => fmt(s.locale, Date.UTC(2023, 0, 1 + i, 12), { weekday: 'narrow', timeZone: 'UTC' }));
  return (
    <main class="stack">
      <h1>{t('world.calendar')}</h1>
      <div class="row">
        <button onClick={() => shift(-1)} aria-label={t('cal.prev')}>‹</button>
        <strong style="flex:1;text-align:center">{fmt(s.locale, Date.UTC(y, m - 1, 1, 12), { month: 'long', year: 'numeric', timeZone: 'UTC' })}</strong>
        <button onClick={() => shift(1)} aria-label={t('cal.next')}>›</button>
      </div>
      <table class="cal">
        <thead><tr>{wd.map((d) => <th>{d}</th>)}</tr></thead>
        <tbody>{grid.map((w) => <tr>{w.map((d) => {
          const isHol = d && hol.some((h) => h.day === d);
          const isToday = d && y === p.year && m === p.month && d === p.day;
          return <td class={`${isHol ? 'hol' : ''} ${isToday ? 'today' : ''}`}>{d ?? ''}</td>;
        })}</tr>)}</tbody>
      </table>
      {hol.length > 0 && <section class="card"><h2>{t('cal.holidays')}</h2><ul class="list">{hol.map((h) => <li>{h.day}: {t(h.key)}</li>)}</ul><p class="muted">{t('cal.review')}</p></section>}
      <section class="card">
        <h2>{t('cal.other')}</h2>
        <ul class="list">{ALT.map((c) => <li>{t(`cal.${c}`)}: {formatInCalendar(now, c, s.locale, tzOf(s))}</li>)}</ul>
      </section>
    </main>
  );
}
