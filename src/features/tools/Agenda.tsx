import { useEffect, useState } from 'preact/hooks';
import { t } from '../../i18n';
import { href } from '../../router';
import { db, type EventRow } from '../../db/dexie';
import { onDay, upcoming, past, toLocalInput, type Repeat } from '../../lib/agenda';
import { scheduleAgenda } from '../../lib/notify';

export const useEvents = () => { const [rows, setRows] = useState<EventRow[]>([]); const load = () => db.events.orderBy('at').toArray().then(setRows).catch(() => {}); useEffect(() => { void load(); }, []); return [rows, load] as const; };
export function Agenda() {
  const [rows, load] = useEvents(); const [title, setTitle] = useState(''); const [when, setWhen] = useState(toLocalInput(Date.now() + 3600e3)); const [note, setNote] = useState(''); const [rep, setRep] = useState<Repeat>('none');
  const now = Date.now(); const today = onDay(rows, new Date()); const next = upcoming(rows, now, 15); const old = past(rows, now).slice(0, 10);
  const refresh = async () => { await load(); void scheduleAgenda(await db.events.toArray()); };
  const add = async () => { const at = new Date(when).getTime(); if (!title.trim() || !Number.isFinite(at)) return; await db.events.add({ title: title.trim(), at, note: note.trim(), repeat: rep }); setTitle(''); setNote(''); await refresh(); };
  const row = (e: EventRow, at: number) => <li class="row card"><span style="flex:1"><b>{e.title}</b><br /><span class="muted">{new Date(at).toLocaleString()}{e.repeat !== 'none' ? ` · ${t(`agenda.rep.${e.repeat}`)}` : ''}{e.note ? ` · ${e.note}` : ''}</span></span><button class="btn" aria-label={t('common.delete')} onClick={async () => { await db.events.delete(e.id!); await refresh(); }}>✕</button></li>;
  return (
    <main class="stack"><h1>{t('agenda.title')}</h1><p class="muted">{t('agenda.privacy')}</p>
      <section class="card stack"><input value={title} onInput={(e) => setTitle((e.target as HTMLInputElement).value)} placeholder={t('agenda.what')} aria-label={t('agenda.what')} />
        <input type="datetime-local" value={when} onInput={(e) => setWhen((e.target as HTMLInputElement).value)} aria-label={t('agenda.when')} />
        <input value={note} onInput={(e) => setNote((e.target as HTMLInputElement).value)} placeholder={t('agenda.note')} aria-label={t('agenda.note')} />
        <select value={rep} onChange={(e) => setRep((e.target as HTMLSelectElement).value as Repeat)} aria-label={t('agenda.repeat')}>{(['none', 'daily', 'weekly', 'yearly'] as Repeat[]).map((r) => <option value={r}>{t(`agenda.rep.${r}`)}</option>)}</select>
        <button class="btn primary" onClick={add}>{t('agenda.add')}</button></section>
      <section class="stack"><h2>{t('agenda.today')}</h2>{today.length ? <ul class="list">{today.map((e) => row(e, e.at))}</ul> : <p class="muted">{t('agenda.none.today')}</p>}</section>
      <section class="stack"><h2>{t('agenda.next')}</h2>{next.length ? <ul class="list">{next.map((e) => row(e, e.next))}</ul> : <p class="muted">{t('agenda.none')}</p>}</section>
      {old.length > 0 && <section class="stack"><h2>{t('agenda.past')}</h2><ul class="list">{old.map((e) => row(e, e.at))}</ul></section>}
      <a class="btn" href={href('world', 'calendar')}>📅 {t('world.calendar')}</a></main>
  );
}
