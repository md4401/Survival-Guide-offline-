import { useEffect, useState } from 'preact/hooks';
import { t } from '../../i18n';
import { db, getKV, setKV, type InvItem } from '../../db/dexie';
import { PremiumGate } from '../../components/PremiumGate';
import { daysLeft, expiryStatus, sortByExpiry, DEFAULT_REMINDERS, isDue, markDone, nextDue, type Reminder } from '../../lib/inventory';
import { scheduleExpiry } from '../../lib/notify';
import { useSettings } from '../../db/settings';

export async function loadReminders(): Promise<Reminder[]> {
  const saved = await getKV<Reminder[]>('reminders', []); const now = Date.now();
  return DEFAULT_REMINDERS.map((d) => saved.find((r) => r.id === d.id) ?? { ...d, last: now });
}
function Inner() {
  const s = useSettings(); const [items, setItems] = useState<InvItem[]>([]); const [rem, setRem] = useState<Reminder[]>([]); const [msg, setMsg] = useState('');
  const [f, setF] = useState({ name: '', qty: '1', unit: '', where: '', expires: '' });
  const load = () => db.inventory.toArray().then((x) => setItems(sortByExpiry(x))).catch(() => {});
  useEffect(() => { load(); loadReminders().then(setRem); }, []);
  const add = async () => { if (!f.name.trim()) return; await db.inventory.add({ name: f.name.trim(), qty: Number(f.qty) || 1, unit: f.unit, where: f.where, expires: f.expires }); setF({ name: '', qty: '1', unit: '', where: '', expires: '' }); load(); };
  const done = (id: string) => { const n = markDone(rem, id); setRem(n); void setKV('reminders', n); };
  const notify = async () => { const n = await scheduleExpiry(await db.inventory.toArray()); setMsg(n ? t('inv.scheduled', { n }) : t('inv.web')); };
  const lbl = (e: string) => ({ expired: t('inv.expired'), soon: t('inv.soon'), ok: t('inv.ok'), none: '' }[expiryStatus(e)]);
  return (
    <main class="stack"><h1>{t('inv.title')}</h1>
      <section class="card stack"><h2>{t('inv.reminders')}</h2>
        {rem.map((r) => <div class="row"><span style="flex:1">{t(`inv.r.${r.id}`)} · {new Date(nextDue(r)).toLocaleDateString(s.locale)}</span>{isDue(r) ? <button class="btn-danger" onClick={() => done(r.id)}>{t('inv.done')}</button> : <span class="badge">{t('inv.ok')}</span>}</div>)}</section>
      <ul class="list">{items.map((i) => { const d = daysLeft(i.expires); const st = expiryStatus(i.expires);
        return <li class="card row"><div style="flex:1"><strong>{i.name}</strong> · {i.qty} {i.unit}<div class="muted">{i.where}{i.expires ? ` · ${i.expires}${d != null ? ` (${d} d)` : ''}` : ''}</div></div>
          {st !== 'none' && <span class={`badge ${st !== 'ok' ? 'badge-warn' : ''}`}>{lbl(i.expires)}</span>}<button onClick={async () => { await db.inventory.delete(i.id!); load(); }} aria-label={t('common.delete')}>🗑</button></li>; })}</ul>
      <section class="card stack"><h2>{t('inv.add')}</h2>
        <input value={f.name} onInput={(e) => setF({ ...f, name: (e.target as HTMLInputElement).value })} placeholder={t('inv.name')} aria-label={t('inv.name')} />
        <div class="row"><input type="number" value={f.qty} style="inline-size:5rem" onInput={(e) => setF({ ...f, qty: (e.target as HTMLInputElement).value })} aria-label={t('inv.qty')} /><input value={f.unit} placeholder={t('inv.unit')} aria-label={t('inv.unit')} onInput={(e) => setF({ ...f, unit: (e.target as HTMLInputElement).value })} /></div>
        <input value={f.where} placeholder={t('inv.where')} aria-label={t('inv.where')} onInput={(e) => setF({ ...f, where: (e.target as HTMLInputElement).value })} />
        <input type="date" value={f.expires} aria-label={t('inv.expires')} onInput={(e) => setF({ ...f, expires: (e.target as HTMLInputElement).value })} />
        <button onClick={add} disabled={!f.name.trim()}>{t('family.add')}</button></section>
      <button onClick={notify}>{t('inv.notify')}</button>{msg && <p role="status" class="muted">{msg}</p>}
    </main>
  );
}
export const Inventory = () => <PremiumGate><Inner /></PremiumGate>;
