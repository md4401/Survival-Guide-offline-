import { useEffect, useState } from 'preact/hooks';
import { t } from '../../i18n';
import { db, getKV, setKV } from '../../db/dexie';
import { seal, open, VaultError, EMPTY_VAULT, MAX_FILE, type Sealed, type VaultData } from '../../lib/vault';
import { usePremium } from '../../components/PremiumGate';

const DOCS = ['id', 'passport', 'birth', 'insurance', 'medical', 'property', 'bank', 'vaccine', 'keys', 'photos'];
const rid = () => Math.random().toString(36).slice(2, 10);
export function Documents() {
  const premium = usePremium();
  const [done, setDone] = useState<Set<string>>(new Set());
  const [sealed, setSealed] = useState<Sealed | null | undefined>(undefined); const [data, setData] = useState<VaultData | null>(null); const [pass, setPass] = useState(''); const [pass2, setPass2] = useState(''); const [err, setErr] = useState('');
  const [d, setD] = useState({ title: '', text: '' }); const [file, setFile] = useState<{ name: string; type: string; b64: string } | undefined>();
  const [fm, setFm] = useState({ name: '', blood: '', allergies: '', meds: '', conditions: '', notes: '' });
  useEffect(() => { db.checklists.toArray().then((r) => setDone(new Set(r.filter((x) => x.done).map((x) => x.key)))).catch(() => {}); getKV<Sealed | null>('vault', null).then(setSealed); }, []);
  const tick = async (id: string) => { const k = `docs:${id}`; const n = new Set(done); const on = !n.has(k); on ? n.add(k) : n.delete(k); setDone(n); await db.checklists.put({ key: k, done: on }).catch(() => {}); };
  const persist = async (v: VaultData) => { setData(v); const s = await seal(pass, v); setSealed(s); await setKV('vault', s); };
  const create = async () => { if (pass.length < 6 || pass !== pass2) { setErr(t('vault.weak')); return; } setErr(''); await persist({ ...EMPTY_VAULT }); setPass2(''); };
  const unlock = async () => { try { setData(await open<VaultData>(pass, sealed!)); setErr(''); } catch (e) { setErr(t(e instanceof VaultError && e.code === 'bad-password' ? 'backup.badpass' : 'backup.corrupt')); } };
  const lock = () => { setData(null); setPass(''); };
  const attach = (e: Event) => { const f = (e.target as HTMLInputElement).files?.[0]; if (!f) return; if (f.size > MAX_FILE) { setErr(t('vault.big')); return; } const r = new FileReader(); r.onload = () => setFile({ name: f.name, type: f.type, b64: String(r.result).split(',')[1] ?? '' }); r.readAsDataURL(f); };
  const dl = (f: NonNullable<VaultData['docs'][number]['file']>) => { const a = document.createElement('a'); a.href = `data:${f.type || 'application/octet-stream'};base64,${f.b64}`; a.download = f.name; a.click(); };
  return (
    <main class="stack"><h1>{t('docs.title')}</h1><p class="muted">{t('docs.hint')}</p>
      <section class="card"><ul class="list">{DOCS.map((id) => <li><label class="row" style="min-block-size:var(--tap)"><input type="checkbox" checked={done.has(`docs:${id}`)} onChange={() => tick(id)} style="inline-size:28px;block-size:28px" /><span>{t(`docs.i.${id}`)}</span></label></li>)}</ul></section>
      <section class="card stack"><h2>{t('vault.title')}</h2><p class="muted">{t('vault.hint')}</p>
        {err && <p class="danger-box" role="alert">{err}</p>}
        {sealed === undefined ? <p>{t('app.loading')}</p> : !sealed ? <>
          <input type="password" value={pass} onInput={(e) => setPass((e.target as HTMLInputElement).value)} placeholder={t('vault.pass')} aria-label={t('vault.pass')} autocomplete="off" />
          <input type="password" value={pass2} onInput={(e) => setPass2((e.target as HTMLInputElement).value)} placeholder={t('vault.pass2')} aria-label={t('vault.pass2')} autocomplete="off" />
          <button class="btn-danger" onClick={create}>{t('vault.create')}</button></> : !data ? <>
          <input type="password" value={pass} onInput={(e) => setPass((e.target as HTMLInputElement).value)} placeholder={t('vault.pass')} aria-label={t('vault.pass')} autocomplete="off" />
          <button class="btn-danger" onClick={unlock}>{t('vault.unlock')}</button></> : <>
          <button onClick={lock}>{t('vault.lock')}</button>
          <ul class="list">{data.docs.map((x) => <li class="card"><div class="row"><strong style="flex:1">{x.title}</strong>{x.file && <button onClick={() => dl(x.file!)}>⬇ {x.file.name}</button>}<button onClick={() => persist({ ...data, docs: data.docs.filter((y) => y.id !== x.id) })} aria-label={t('common.delete')}>🗑</button></div><div style="white-space:pre-wrap">{x.text}</div></li>)}</ul>
          <input value={d.title} onInput={(e) => setD({ ...d, title: (e.target as HTMLInputElement).value })} placeholder={t('vault.entry')} aria-label={t('vault.entry')} />
          <textarea rows={2} value={d.text} onInput={(e) => setD({ ...d, text: (e.target as HTMLTextAreaElement).value })} placeholder={t('vault.text')} aria-label={t('vault.text')} style="inline-size:100%" />
          <label class="btn">{file ? file.name : t('vault.attach')}<input type="file" class="sr-only" onChange={attach} /></label>
          <button onClick={async () => { if (!d.title.trim()) return; await persist({ ...data, docs: [...data.docs, { id: rid(), title: d.title.trim(), text: d.text, file }] }); setD({ title: '', text: '' }); setFile(undefined); }} disabled={!d.title.trim()}>{t('family.add')}</button>
          {premium ? <section class="stack"><h2>{t('vault.family')}</h2><p class="muted">{t('vault.family.hint')}</p>
            <ul class="list">{data.family.map((m) => <li class="card"><div class="row"><strong style="flex:1">{m.name}</strong><button onClick={() => persist({ ...data, family: data.family.filter((y) => y.id !== m.id) })} aria-label={t('common.delete')}>🗑</button></div>
              {(['blood', 'allergies', 'meds', 'conditions', 'notes'] as const).filter((k) => m[k]).map((k) => <div><span class="muted">{t(`medcard.${k}`)}: </span>{m[k]}</div>)}</li>)}</ul>
            <input value={fm.name} onInput={(e) => setFm({ ...fm, name: (e.target as HTMLInputElement).value })} placeholder={t('family.name')} aria-label={t('family.name')} />
            {(['blood', 'allergies', 'meds', 'conditions', 'notes'] as const).map((k) => <input value={fm[k]} placeholder={t(`medcard.${k}`)} aria-label={t(`medcard.${k}`)} onInput={(e) => setFm({ ...fm, [k]: (e.target as HTMLInputElement).value })} />)}
            <button disabled={!fm.name.trim()} onClick={async () => { await persist({ ...data, family: [...data.family, { id: rid(), ...fm }] }); setFm({ name: '', blood: '', allergies: '', meds: '', conditions: '', notes: '' }); }}>{t('family.add')}</button></section>
            : <p class="muted">{t('gate.soon')}</p>}</>}
      </section>
    </main>
  );
}
