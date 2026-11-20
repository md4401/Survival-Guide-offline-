import { BleCard } from './BleCard';
import { useEffect, useState } from 'preact/hooks';
import { t } from '../../i18n';
import { href, go } from '../../router';
import { useSettings } from '../../db/settings';
import { fingerprint, randomPassphrase } from '../../lib/mesh/crypto';
import { createMessage, readText, PUBLIC, type Msg } from '../../lib/mesh/protocol';
import { addChannel, dbStore, ensureIdentity, keyMap, loadChannels, removeChannel, renameIdentity, type Channel } from '../../lib/mesh/store';
import { getNode, link, notifyMesh, onLink, onMeshChange } from '../../lib/mesh/hub';
import { packText, unpackText } from '../../lib/mesh/bundle';
import { limit } from '../../data/plans';
import { MultiQr } from '../../components/Qr';
import type { Identity } from '../../lib/mesh/crypto';

const JOIN = { raw: 'SGMJ0.', zip: 'SGMJ1.' };
function useMesh() {
  const [me, setMe] = useState<Identity | null>(null); const [channels, setChannels] = useState<Channel[]>([]); const [tick, setTick] = useState(0);
  useEffect(() => { (async () => { setMe(await ensureIdentity(`${t('msg.anon')}-${Math.floor(100 + Math.random() * 900)}`)); setChannels(await loadChannels()); await dbStore.prune(); })(); return onMeshChange(() => setTick((n) => n + 1)); }, []);
  const reload = async () => { setChannels(await loadChannels()); setMe(await ensureIdentity('')); };
  return { me, channels, tick, reload };
}

export function MessagesHub() {
  useSettings();
  const { me, channels, reload } = useMesh();
  const [name, setName] = useState(''); const [joinTxt, setJoinTxt] = useState(''); const [joinName, setJoinName] = useState('');
  const [created, setCreated] = useState<{ ch: Channel; pass: string; code: string } | null>(null); const [err, setErr] = useState('');
  const max = limit('privateChannels');
  const create = async () => {
    setErr(''); if (channels.length >= max) { setErr(t('msg.limit', { n: max })); return; }
    const pass = randomPassphrase(); const ch = await addChannel(name || t('msg.private'), pass);
    setCreated({ ch, pass, code: await packText({ n: ch.name, p: pass }, JOIN) }); setName(''); await reload();
  };
  const join = async () => {
    setErr(''); if (channels.length >= max) { setErr(t('msg.limit', { n: max })); return; }
    let nm = joinName, pass = joinTxt.trim();
    if (pass.startsWith('SGMJ')) { try { const j: any = await unpackText(pass, JOIN); pass = String(j.p ?? ''); nm = nm || String(j.n ?? ''); } catch { setErr(t('msg.invalid')); return; } }
    if (pass.length < 8) { setErr(t('msg.invalid')); return; }
    const ch = await addChannel(nm || t('msg.private'), pass); setJoinTxt(''); setJoinName(''); await reload(); go('messages', 'c', ch.id);
  };
  if (!me) return <main><p>{t('app.loading')}</p></main>;
  return (
    <main class="stack">
      <h1>{t('msg.title')}</h1>
      <p>{t('msg.intro')}</p>
      <section class="card stack">
        <label class="row"><span>{t('msg.name')}</span><input value={me.name} maxLength={32} onChange={async (e) => { await renameIdentity((e.target as HTMLInputElement).value); await reload(); }} /></label>
        <p class="muted">{t('msg.fingerprint')}: <code dir="ltr">{fingerprint(me.pub)}</code></p>
      </section>
      <ul class="list">
        <li><a class="btn btn-block" href={href('messages', 'c', PUBLIC)}>📢 {t('msg.public')}</a><p class="muted">{t('msg.public.hint')}</p></li>
        {channels.map((c) => <li><a class="btn btn-block" href={href('messages', 'c', c.id)}>🔒 {c.name}</a></li>)}
      </ul>
      <BleCard />
      <a class="btn btn-block" href={href('messages', 'geo')}>📍 {t('geo.title')}</a>
      <a class="btn btn-block btn-danger" href={href('messages', 'sync')}>🔄 {t('msg.sync')}</a>
      {err && <p class="danger-box" role="alert">{err}</p>}
      <section class="card stack"><h2>{t('msg.new')}</h2>
        <input value={name} onInput={(e) => setName((e.target as HTMLInputElement).value)} placeholder={t('msg.newname')} aria-label={t('msg.newname')} />
        <button onClick={create}>{t('msg.create')}</button>
        {created && <div class="stack"><p class="danger-box">{t('msg.share')}</p><p>{t('msg.passphrase')}: <strong dir="ltr" style="font-size:1.3em">{created.pass}</strong></p><p class="muted">{t('msg.joincode')}</p><MultiQr text={created.code} />
          <textarea readOnly rows={3} value={created.code} style="inline-size:100%" onClick={(e) => (e.target as HTMLTextAreaElement).select()} aria-label={t('msg.joincode')} /></div>}
      </section>
      <section class="card stack"><h2>{t('msg.join')}</h2><p class="muted">{t('msg.joinhint')}</p>
        <input value={joinName} onInput={(e) => setJoinName((e.target as HTMLInputElement).value)} placeholder={t('msg.newname')} aria-label={t('msg.newname')} />
        <textarea rows={2} value={joinTxt} onInput={(e) => setJoinTxt((e.target as HTMLTextAreaElement).value)} placeholder={t('msg.passphrase')} aria-label={t('msg.passphrase')} style="inline-size:100%" />
        <button onClick={join} disabled={!joinTxt.trim()}>{t('msg.joinbtn')}</button></section>
      <p class="muted">{t('msg.note', { d: 7 })}</p>
    </main>
  );
}

export function Thread({ id }: { id: string }) {
  const s = useSettings();
  const { me, channels, tick } = useMesh();
  const [rows, setRows] = useState<Array<{ m: Msg; text: string | null }>>([]);
  const [text, setText] = useState(''); const [note, setNote] = useState('');
  const [, force] = useState(0); useEffect(() => onLink(() => force((n) => n + 1)), []);
  const ch = channels.find((c) => c.id === id); const isPublic = id === PUBLIC;
  useEffect(() => {
    (async () => {
      const keys = keyMap(channels); const list = await dbStore.list(id, 300);
      setRows(await Promise.all(list.map(async (m) => ({ m, text: await readText(m, keys) }))));
    })();
  }, [id, channels, tick]);
  const send = async (body: string, kind: 'text' | 'sos' = 'text') => {
    if (!me || !body.trim()) return;
    const key = ch ? keyMap([ch]).get(ch.id) : undefined;
    const m = await createMessage(me, { id, key }, body, kind); const node = getNode(); await node.publish(m); await dbStore.markMine(m.id); notifyMesh(m); setText('');
  };
  const sos = () => {
    setNote('');
    const done = (pos?: GeolocationPosition) => send(pos ? `SOS ${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)} (±${Math.round(pos.coords.accuracy)} m)` : 'SOS', 'sos');
    if (!navigator.geolocation) { void done(); return; }
    navigator.geolocation.getCurrentPosition((p) => void done(p), () => { setNote(t('msg.sos.nopos')); void done(); }, { timeout: 15000, enableHighAccuracy: true });
  };
  if (!isPublic && !ch) return <main><p>{t('guide.notFound')}</p></main>;
  const fmtTime = (ts: number) => new Date(ts).toLocaleString(s.locale, { dateStyle: 'short', timeStyle: 'short' });
  return (
    <main class="stack">
      <h1>{isPublic ? t('msg.public') : ch!.name}</h1>
      {link.phase === 'connected' && <p role="status" class="badge badge-warn">{t('msg.link.connected', { name: link.peer || '…' })}</p>}
      {isPublic && <p class="danger-box">{t('msg.public.hint')}</p>}
      <ul class="list">{rows.length === 0 && <li class="muted">{t('msg.empty')}</li>}
        {rows.map(({ m, text: tx }) => (
          <li class={`card ${m.kind === 'sos' ? 'danger-box' : ''}`}>
            <div class="muted">{m.name} · <code dir="ltr">{fingerprint(m.from).slice(0, 9)}</code> · {fmtTime(m.ts)} · {m.hops === 0 ? t('msg.direct') : t('msg.hops', { n: m.hops })} ✓</div>
            <div style="white-space:pre-wrap;font-size:1.1em">{tx ?? t('msg.locked')}</div>
          </li>))}
      </ul>
      {note && <p class="muted" role="status">{note}</p>}
      <div class="row">
        <input style="flex:1" value={text} maxLength={600} onInput={(e) => setText((e.target as HTMLInputElement).value)} onKeyDown={(e) => e.key === 'Enter' && send(text)} placeholder={t('msg.placeholder')} aria-label={t('msg.placeholder')} />
        <button class="btn-danger" onClick={() => send(text)} disabled={!text.trim()}>{t('msg.send')}</button>
      </div>
      {isPublic && <button class="btn-block btn-danger help-btn" onClick={sos}>🆘 {t('msg.sos.pos')}</button>}
      <div class="row"><a class="btn" href={href('messages', 'sync')}>🔄 {t('msg.sync')}</a>
        {!isPublic && <button onClick={async () => { await removeChannel(id); go('messages'); }}>{t('msg.remove')}</button>}</div>
    </main>
  );
}
