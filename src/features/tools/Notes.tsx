import { useEffect, useRef, useState } from 'preact/hooks';
import { t } from '../../i18n';
import { db, type Note } from '../../db/dexie';
import { SketchPad, shrinkImage } from '../../components/SketchPad';
import { History, isTask, toggleTask, toggleTaskLine, lineAt, countChars, titleOf } from '../../lib/notes';
import { useSettings } from '../../db/settings';

function Editor({ note, onClose }: { note: Note; onClose: () => void }) {
  const loc = useSettings().locale; const [title, setTitle] = useState(note.title ?? ''); const [text, setText] = useState(note.text); const [sketches, setSketches] = useState(note.sketches ?? []); const [images, setImages] = useState(note.images ?? []); const [draw, setDraw] = useState(false);
  const hist = useRef(new History(note.text)); const ta = useRef<HTMLTextAreaElement>(null); const [, force] = useState(0); const id = useRef(note.id);
  const change = (v: string) => { hist.current.push(v); setText(v); force((n) => n + 1); };
  const save = async () => { const empty = !title.trim() && !text.trim() && !sketches.length && !images.length; const row = { title: title.trim(), text, sketches, images, at: Date.now() }; if (empty) { if (id.current != null) await db.notes.delete(id.current); } else if (id.current != null) await db.notes.update(id.current, row); else id.current = await db.notes.add(row); onClose(); };
  if (draw) return <main class="stack"><SketchPad onCancel={() => setDraw(false)} onDone={(p) => { setSketches([...sketches, p]); setDraw(false); }} /></main>;
  const tasks = text.split('\n').map((l, i) => [l, i] as const).filter(([l]) => isTask(l));
  return (
    <main class="stack">
      <div class="row" style="justify-content:space-between"><button class="btn" aria-label={t('common.back')} onClick={save}>←</button><div class="row"><button class="btn" aria-label={t('notes.undo')} disabled={!hist.current.canUndo} onClick={() => { const v = hist.current.undo(); if (v != null) { setText(v); force((n) => n + 1); } }}>↶</button><button class="btn" aria-label={t('notes.redo')} disabled={!hist.current.canRedo} onClick={() => { const v = hist.current.redo(); if (v != null) { setText(v); force((n) => n + 1); } }}>↷</button></div><button class="btn primary" aria-label={t('common.save')} onClick={save}>✓</button></div>
      <input value={title} onInput={(e) => setTitle((e.target as HTMLInputElement).value)} placeholder={t('notes.titlePh')} aria-label={t('notes.titlePh')} style="font-size:1.6rem;font-weight:700;border:0;background:none" />
      <p class="muted">{new Date(note.at).toLocaleString(loc, { dateStyle: 'long', timeStyle: 'short' })} | {t('notes.chars', { n: countChars(text) })}</p>
      <textarea ref={ta} rows={9} value={text} onInput={(e) => change((e.target as HTMLTextAreaElement).value)} placeholder={t('notes.placeholder')} aria-label={t('notes.placeholder')} style="inline-size:100%" />
      {tasks.length > 0 && <ul class="list">{tasks.map(([l, i]) => <li><label class="row"><input type="checkbox" checked={l.startsWith('[x] ')} onChange={() => change(toggleTask(text, i))} /><span style={l.startsWith('[x] ') ? 'text-decoration:line-through' : ''}>{l.slice(4)}</span></label></li>)}</ul>}
      {[...sketches.map((s, i) => ['s', s, i] as const), ...images.map((s, i) => ['i', s, i] as const)].map(([k, src, i]) => <div class="card stack"><img src={src} alt={k === 's' ? t('sketch.title') : t('notes.image')} style="max-inline-size:100%;border-radius:8px;background:#fff" /><button class="btn" onClick={() => (k === 's' ? setSketches(sketches.filter((_, j) => j !== i)) : setImages(images.filter((_, j) => j !== i)))}>{t('common.delete')}</button></div>)}
      <div class="row" role="toolbar" style="justify-content:space-around">
        <button class="btn" aria-label={t('notes.checklist')} onClick={() => { const pos = ta.current?.selectionStart ?? text.length; change(toggleTaskLine(text, lineAt(text, pos))); }}>☑</button>
        <button class="btn" aria-label={t('sketch.title')} onClick={() => setDraw(true)}>✏️</button>
        <label class="btn" aria-label={t('notes.image')}>🖼<input type="file" accept="image/*" hidden onChange={async (e) => { const f = (e.target as HTMLInputElement).files?.[0]; if (f) try { setImages([...images, await shrinkImage(f)]); } catch { /* unreadable image */ } }} /></label>
      </div>
    </main>
  );
}
export function Notes() {
  const [items, setItems] = useState<Note[]>([]); const [q, setQ] = useState(''); const [edit, setEdit] = useState<Note | null>(null); const loc = useSettings().locale;
  const load = () => db.notes.orderBy('at').reverse().toArray().then(setItems).catch(() => {});
  useEffect(() => { void load(); }, []);
  if (edit) return <Editor note={edit} onClose={() => { setEdit(null); void load(); }} />;
  const n = q.toLowerCase(); const shown = items.filter((x) => !n || `${x.title ?? ''} ${x.text}`.toLowerCase().includes(n));
  return (
    <main class="stack">
      <div class="row" style="justify-content:space-between"><h1 style="margin:0">{t('notes.title')}</h1><button class="btn primary" aria-label={t('notes.add')} onClick={() => setEdit({ text: '', at: Date.now() })}>＋</button></div>
      <input type="search" value={q} onInput={(e) => setQ((e.target as HTMLInputElement).value)} placeholder={t('common.search')} aria-label={t('common.search')} />
      {shown.length === 0 && <p class="muted">{t('notes.none')}</p>}
      <ul class="list">{shown.map((x) => <li><button class="btn card stack" onClick={() => setEdit(x)} style="inline-size:100%"><b>{titleOf(x) || t('notes.untitled')}</b><span class="muted" style="white-space:pre-wrap">{x.text.split('\n').filter((l) => l.trim()).slice(0, 3).join('\n').slice(0, 160)}</span>{((x.sketches?.length ?? 0) + (x.images?.length ?? 0)) > 0 && <span aria-hidden="true">🖼 {(x.sketches?.length ?? 0) + (x.images?.length ?? 0)}</span>}<span class="muted">{new Date(x.at).toLocaleDateString(loc)}</span></button></li>)}</ul>
    </main>
  );
}
