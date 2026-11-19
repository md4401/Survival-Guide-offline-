import { useEffect, useState } from 'preact/hooks';
import { t } from '../../i18n';
import { db, type Note } from '../../db/dexie';

export function Notes() {
  const [items, setItems] = useState<Note[]>([]);
  const [text, setText] = useState(''); const [q, setQ] = useState('');
  const load = () => db.notes.orderBy('at').reverse().toArray().then(setItems).catch(() => {});
  useEffect(() => { load(); }, []);
  const add = async () => { if (!text.trim()) return; await db.notes.add({ text: text.trim(), at: Date.now() }).catch(() => {}); setText(''); load(); };
  const shown = items.filter((n) => n.text.toLowerCase().includes(q.toLowerCase()));
  return (
    <main class="stack">
      <h1>{t('notes.title')}</h1>
      <textarea rows={3} value={text} onInput={(e) => setText((e.target as HTMLTextAreaElement).value)} placeholder={t('notes.placeholder')} aria-label={t('notes.placeholder')} style="inline-size:100%" />
      <button onClick={add}>{t('notes.add')}</button>
      <input type="search" value={q} onInput={(e) => setQ((e.target as HTMLInputElement).value)} placeholder={t('common.search')} aria-label={t('common.search')} />
      {shown.map((n) => <div class="card row"><span style="flex:1;white-space:pre-wrap">{n.text}</span>
        <button onClick={() => n.id != null && db.notes.delete(n.id).then(load)} aria-label={t('common.delete')}>🗑</button></div>)}
    </main>
  );
}
