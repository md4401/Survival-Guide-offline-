import { useEffect, useRef, useState } from 'preact/hooks';
import { t } from '../../i18n';
import { getKV, setKV } from '../../db/dexie';
import { channelsFor, isGeohash } from '../../lib/geohash';
import { DEFAULT_RELAYS, makeGeoEvent, randomSecret, channelKey, nickOf, shortId, type NEvent } from '../../lib/nostr';
import { RelayPool } from '../../lib/relay';

/** Location channels over public Nostr relays. Off until the user agrees; only a coarse geohash is ever shared. */
export function GeoChannels() {
  const [on, setOn] = useState<boolean | null>(null); const [pos, setPos] = useState<{ lat: number; lon: number } | null>(null); const [err, setErr] = useState('');
  const [chan, setChan] = useState(''); const [manual, setManual] = useState(''); const [nick, setNick] = useState('');
  useEffect(() => { void getKV('geoOn', false).then(setOn); void getKV('geoNick', '').then(setNick); }, []);
  const locate = () => { setErr(''); if (!navigator.geolocation) return setErr(t('geo.nogps')); navigator.geolocation.getCurrentPosition((p) => setPos({ lat: p.coords.latitude, lon: p.coords.longitude }), () => setErr(t('geo.nogps')), { timeout: 15000, maximumAge: 600000 }); };
  useEffect(() => { if (on) locate(); }, [on]);
  if (on === null) return <main />;
  if (!on) return (
    <main class="stack"><h1>{t('geo.title')}</h1>
      <div class="card stack"><p>{t('geo.consent')}</p><ul class="list"><li>{t('geo.c1')}</li><li>{t('geo.c2')}</li><li>{t('geo.c3')}</li></ul>
        <button class="btn primary" onClick={async () => { await setKV('geoOn', true); setOn(true); }}>{t('geo.enable')}</button></div></main>
  );
  if (chan) return <Room hash={chan} nick={nick} onLeave={() => setChan('')} />;
  const list = pos ? channelsFor(pos.lat, pos.lon) : [];
  return (
    <main class="stack"><h1>{t('geo.title')}</h1>
      <label class="stack">{t('geo.nick')}<input value={nick} maxLength={32} onInput={(e) => { const v = (e.target as HTMLInputElement).value; setNick(v); void setKV('geoNick', v); }} /></label>
      {err && <p class="danger-box" role="alert">{err}</p>}{!pos && !err && <p class="muted">{t('geo.locating')}</p>}
      <ul class="list">{list.map((c) => <li><button class="btn card" style="inline-size:100%;text-align:start" onClick={() => setChan(c.hash)}><b>{t(`geo.lvl.${c.id}`)}</b><br /><span class="muted">#{c.hash} · ~{c.km} km</span></button></li>)}</ul>
      <div class="row"><input value={manual} placeholder="# geohash" aria-label="geohash" onInput={(e) => setManual((e.target as HTMLInputElement).value.toLowerCase().replace('#', ''))} /><button class="btn" disabled={!isGeohash(manual)} onClick={() => setChan(manual)}>{t('geo.teleport')}</button></div>
      <button class="btn btn-danger" onClick={async () => { await setKV('geoOn', false); setOn(false); setPos(null); }}>{t('geo.disable')}</button></main>
  );
}

function Room({ hash, nick, onLeave }: { hash: string; nick: string; onLeave: () => void }) {
  const [msgs, setMsgs] = useState<NEvent[]>([]); const [open, setOpen] = useState(0); const [text, setText] = useState(''); const pool = useRef<RelayPool | undefined>(undefined); const secret = useRef(''); const last = useRef(0);
  useEffect(() => {
    let dead = false;
    void (async () => { let s = await getKV('geoSecret', ''); if (!s) { s = randomSecret(); await setKV('geoSecret', s); } secret.current = s; if (dead) return;
      const p = new RelayPool(DEFAULT_RELAYS, (e) => setMsgs((m) => [...m, e].sort((a, b) => a.created_at - b.created_at).slice(-200)), setOpen); pool.current = p; p.connect(); p.subscribe(hash); })();
    return () => { dead = true; pool.current?.close(); };
  }, [hash]);
  const send = () => { const v = text.trim(); if (!v || !secret.current || Date.now() - last.current < 1000) return; last.current = Date.now(); const e = makeGeoEvent(channelKey(secret.current, hash), hash, v, nick); pool.current?.publish(e); setMsgs((m) => [...m, e]); setText(''); };
  return (
    <main class="stack"><div class="row" style="justify-content:space-between"><button class="btn" aria-label={t('common.back')} onClick={onLeave}>←</button><b>#{hash}</b><span class="muted">{t('geo.relays', { n: open })}</span></div>
      <p class="muted">{t('geo.public')}</p>
      <ul class="list" aria-live="polite">{msgs.map((e) => <li class="card"><b>{nickOf(e) || 'anon'}</b> <span class="muted">#{shortId(e.pubkey)}</span><br />{e.content}</li>)}</ul>
      <div class="row"><input value={text} maxLength={500} aria-label={t('geo.write')} onInput={(e) => setText((e.target as HTMLInputElement).value)} onKeyDown={(e) => e.key === 'Enter' && send()} /><button class="btn primary" onClick={send}>{t('geo.send')}</button></div></main>
  );
}
