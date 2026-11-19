import { useEffect, useState } from 'preact/hooks';
import { t } from '../../i18n';
import { useSettings } from '../../db/settings';
import { db, type Counter as C } from '../../db/dexie';
import { dayNumber, elapsed } from '../../lib/clock';
import { tzOf, useNow } from './shared';

const today = () => new Date().toISOString().slice(0, 10);
export function Counter() {
  const s = useSettings();
  const now = useNow(30000);
  const [items, setItems] = useState<C[]>([]);
  const [name, setName] = useState('');
  const [date, setDate] = useState(today());
  const [type, setType] = useState<'up' | 'down'>('up');
  const load = () => db.counters.toArray().then(setItems).catch(() => {});
  useEffect(() => { load(); }, []);
  const add = async () => {
    if (!name.trim()) return;
    try { await db.counters.add({ name: name.trim(), start: new Date(date + 'T00:00:00').getTime(), type }); } catch { /* storage unavailable */ }
    setName(''); load();
  };
  const del = async (id?: number) => { if (id != null) { await db.counters.delete(id).catch(() => {}); load(); } };
  return (
    <main class="stack">
      <h1>{t('world.counter')}</h1>
      {items.length === 0 && <p class="muted">{t('counter.none')}</p>}
      {items.map((c) => {
        const tz = tzOf(s);
        const n = c.type === 'up' ? dayNumber(c.start, now, tz) : Math.max(0, -dayNumber(c.start, now, tz) + 2);
        const e = elapsed(c.start, now);
        return (
          <div class="card row">
            <div style="flex:1">
              <div>{c.name}</div>
              <div class="big-num">{c.type === 'up' ? t('counter.day', { n }) : t('counter.left', { n })}</div>
              {c.type === 'up' && <div class="muted">{t('counter.elapsed', { d: e.days, h: e.hours, m: e.minutes })}</div>}
            </div>
            <button onClick={() => del(c.id)} aria-label={t('common.delete')}>🗑</button>
          </div>
        );
      })}
      <section class="card stack">
        <h2>{t('counter.new')}</h2>
        <input value={name} onInput={(e) => setName((e.target as HTMLInputElement).value)} placeholder={t('counter.name')} aria-label={t('counter.name')} />
        <input type="date" value={date} onInput={(e) => setDate((e.target as HTMLInputElement).value)} aria-label={t('counter.date')} />
        <select value={type} onChange={(e) => setType((e.target as HTMLSelectElement).value as any)}>
          <option value="up">{t('counter.up')}</option><option value="down">{t('counter.down')}</option>
        </select>
        <button class="btn-block" onClick={add}>{t('common.save')}</button>
      </section>
    </main>
  );
}
