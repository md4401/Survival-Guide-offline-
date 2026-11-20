import { useEffect, useState } from 'preact/hooks';
import { t } from '../../i18n';
import { href } from '../../router';
import { db, type EventRow } from '../../db/dexie';
import { onDay, toLocalInput, firstDay, monthGrid, weekDays, eventBox, sameDate, startOfDay, type Repeat } from '../../lib/agenda';
import { scheduleAgenda } from '../../lib/notify';
import { useSettings } from '../../db/settings';

export const useEvents = () => { const [rows, setRows] = useState<EventRow[]>([]); const load = () => db.events.orderBy('at').toArray().then(setRows).catch(() => {}); useEffect(() => { void load(); }, []); return [rows, load] as const; };
type View = 'year' | 'month' | 'week' | 'day';
const HOUR = 48; // px per hour in the time grid

function Form({ day, ev, onDone }: { day: Date; ev?: EventRow; onDone: (changed: boolean) => void }) {
  const base = ev ? new Date(ev.at) : new Date(day.getFullYear(), day.getMonth(), day.getDate(), new Date().getHours() + 1);
  const [title, setTitle] = useState(ev?.title ?? ''); const [when, setWhen] = useState(toLocalInput(base.getTime())); const [dur, setDur] = useState(ev?.dur ?? 60); const [all, setAll] = useState(!!ev?.allDay); const [note, setNote] = useState(ev?.note ?? ''); const [rep, setRep] = useState<Repeat>(ev?.repeat ?? 'none');
  const save = async () => { let at = new Date(when).getTime(); if (!title.trim() || !Number.isFinite(at)) return; if (all) at = startOfDay(new Date(at)).getTime(); const row = { title: title.trim(), at, note: note.trim(), repeat: rep, dur, allDay: all }; if (ev?.id != null) await db.events.update(ev.id, row); else await db.events.add(row); onDone(true); };
  return (
    <section class="card stack" role="dialog" aria-label={t('agenda.add')}>
      <input value={title} onInput={(e) => setTitle((e.target as HTMLInputElement).value)} placeholder={t('agenda.what')} aria-label={t('agenda.what')} />
      <label class="row"><input type="checkbox" checked={all} onChange={(e) => setAll((e.target as HTMLInputElement).checked)} />{t('agenda.allday')}</label>
      <input type={all ? 'date' : 'datetime-local'} value={all ? when.slice(0, 10) : when} onInput={(e) => { const v = (e.target as HTMLInputElement).value; setWhen(all ? `${v}T00:00` : v); }} aria-label={t('agenda.when')} />
      {!all && <label class="row">{t('agenda.duration')}<select value={dur} onChange={(e) => setDur(Number((e.target as HTMLSelectElement).value))}>{[15, 30, 60, 90, 120, 180, 240].map((m) => <option value={m}>{m} min</option>)}</select></label>}
      <input value={note} onInput={(e) => setNote((e.target as HTMLInputElement).value)} placeholder={t('agenda.note')} aria-label={t('agenda.note')} />
      <select value={rep} onChange={(e) => setRep((e.target as HTMLSelectElement).value as Repeat)} aria-label={t('agenda.repeat')}>{(['none', 'daily', 'weekly', 'yearly'] as Repeat[]).map((r) => <option value={r}>{t(`agenda.rep.${r}`)}</option>)}</select>
      <div class="row"><button class="btn primary" onClick={save}>{t('common.save')}</button><button class="btn" onClick={() => onDone(false)}>{t('common.cancel')}</button>{ev?.id != null && <button class="btn" onClick={async () => { await db.events.delete(ev.id!); onDone(true); }}>{t('common.delete')}</button>}</div>
    </section>
  );
}

export function Agenda() {
  const loc = useSettings().locale; const first = firstDay(loc); const [rows, load] = useEvents(); const [view, setView] = useState<View>('month'); const [cur, setCur] = useState(startOfDay(new Date())); const [form, setForm] = useState<{ ev?: EventRow } | null>(null);
  const today = new Date();
  const done = async (changed: boolean) => { setForm(null); if (changed) { await load(); void scheduleAgenda(await db.events.toArray()); } };
  const shift = (n: number) => setCur(view === 'year' ? new Date(cur.getFullYear() + n, cur.getMonth(), 1) : view === 'month' ? new Date(cur.getFullYear(), cur.getMonth() + n, 1) : new Date(cur.getFullYear(), cur.getMonth(), cur.getDate() + n * (view === 'week' ? 7 : 1)));
  const fmt = (o: Intl.DateTimeFormatOptions, d = cur) => d.toLocaleDateString(loc, o);
  const heading = view === 'year' ? String(cur.getFullYear()) : view === 'month' ? fmt({ month: 'long', year: 'numeric' }) : view === 'week' ? `${fmt({ day: 'numeric', month: 'short' }, weekDays(cur, first)[0])} – ${fmt({ day: 'numeric', month: 'short' }, weekDays(cur, first)[6])}` : fmt({ weekday: 'long', day: 'numeric', month: 'long' });
  const wd = weekDays(cur, first);
  const evRow = (e: EventRow) => <li><button class="btn card" style="inline-size:100%;text-align:start" onClick={() => setForm({ ev: e })}><b>{e.title}</b><br /><span class="muted">{e.allDay ? t('agenda.allday') : new Date(e.at).toLocaleTimeString(loc, { timeStyle: 'short' })}{e.repeat !== 'none' ? ` · ${t(`agenda.rep.${e.repeat}`)}` : ''}{e.note ? ` · ${e.note}` : ''}</span></button></li>;
  const dayList = (d: Date) => { const l = onDay(rows, d) as EventRow[]; return l.length ? <ul class="list">{l.map(evRow)}</ul> : <p class="muted">{t('agenda.none.today')}</p>; };
  const timeGrid = (days: Date[]) => (
    <div class="stack">
      <div class="row" style="padding-inline-start:44px">{days.map((d) => <div style="flex:1;text-align:center" aria-current={sameDate(d, today) ? 'date' : undefined}><div class="muted">{fmt({ weekday: 'short' }, d)}</div><b>{d.getDate()}</b>{(onDay(rows, d) as EventRow[]).filter((e) => e.allDay).map((e) => <div class="chip" onClick={() => setForm({ ev: e })}>{e.title}</div>)}</div>)}</div>
      <div style={`position:relative;display:flex;block-size:${HOUR * 24}px`}>
        <div style="inline-size:44px">{Array.from({ length: 24 }, (_, h) => <div class="muted" style={`block-size:${HOUR}px;font-size:.75rem`}>{String(h).padStart(2, '0')}:00</div>)}</div>
        {days.map((d) => <div style={`flex:1;position:relative;border-inline-start:1px solid var(--border-strong);background:repeating-linear-gradient(to bottom,transparent 0,transparent ${HOUR - 1}px,var(--border-strong) ${HOUR - 1}px,var(--border-strong) ${HOUR}px)`}>
          {(onDay(rows, d) as EventRow[]).filter((e) => !e.allDay).map((e) => { const b = eventBox({ at: new Date(d.getFullYear(), d.getMonth(), d.getDate(), new Date(e.at).getHours(), new Date(e.at).getMinutes()).getTime(), dur: e.dur }, d); return b ? <button class="chip" style={`position:absolute;inset-inline:2px;inset-block-start:${(b.top / 60) * HOUR}px;block-size:${Math.max(20, (b.height / 60) * HOUR)}px;overflow:hidden;text-align:start`} onClick={() => setForm({ ev: e })}>{e.title}</button> : null; })}
        </div>)}
      </div>
    </div>
  );
  if (form) return <main class="stack"><Form day={cur} ev={form.ev} onDone={done} /></main>;
  return (
    <main class="stack">
      <div class="row" style="justify-content:space-between"><h1 style="margin:0">{t('agenda.title')}</h1><button class="btn primary" aria-label={t('agenda.add')} onClick={() => setForm({})}>＋</button></div>
      <div class="row" role="tablist">{(['year', 'month', 'week', 'day'] as View[]).map((v) => <button role="tab" aria-selected={view === v} class={`btn${view === v ? ' primary' : ''}`} onClick={() => setView(v)}>{t(`agenda.view.${v}`)}</button>)}</div>
      <div class="row" style="justify-content:space-between"><button class="btn" aria-label={t('agenda.prev')} onClick={() => shift(-1)}>‹</button><b style="text-transform:capitalize">{heading}</b><button class="btn" aria-label={t('agenda.nextp')} onClick={() => shift(1)}>›</button></div>
      <button class="btn" onClick={() => setCur(startOfDay(new Date()))}>{t('agenda.todaybtn')}</button>
      {view === 'year' && <div class="grid">{Array.from({ length: 12 }, (_, m) => <button class="btn card" onClick={() => { setCur(new Date(cur.getFullYear(), m, 1)); setView('month'); }}>{new Date(2000, m, 1).toLocaleDateString(loc, { month: 'long' })}</button>)}</div>}
      {view === 'month' && <>
        <div style="display:grid;grid-template-columns:repeat(7,1fr);text-align:center">{wd.map((d) => <span class="muted">{fmt({ weekday: 'narrow' }, d)}</span>)}
          {monthGrid(cur.getFullYear(), cur.getMonth(), first).map((d) => { const n = (onDay(rows, d) as EventRow[]).length; const sel = sameDate(d, cur); return <button class={`btn${sel ? ' primary' : ''}`} style={`min-block-size:48px;opacity:${d.getMonth() === cur.getMonth() ? 1 : 0.4};${sameDate(d, today) ? 'outline:2px solid var(--neon)' : ''}`} aria-label={d.toLocaleDateString(loc, { dateStyle: 'full' })} onClick={() => setCur(d)}>{d.getDate()}<br /><span aria-hidden="true">{n ? '•'.repeat(Math.min(n, 3)) : ' '}</span></button>; })}</div>
        <h2>{fmt({ weekday: 'long', day: 'numeric', month: 'long' })}</h2>{dayList(cur)}</>}
      {view === 'week' && timeGrid(wd)}
      {view === 'day' && timeGrid([cur])}
      <a class="btn" href={href('world', 'calendar')}>📅 {t('world.calendar')}</a>
    </main>
  );
}
