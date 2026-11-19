import { useEffect, useState } from 'preact/hooks';
import { t } from '../../i18n';
import { getKV, setKV } from '../../db/dexie';
import { energyReport, mahToWh, type Device } from '../../lib/energy';

export function Energy() {
  const [ds, setDs] = useState<Device[]>([]); const [wh, setWh] = useState(74); const [mah, setMah] = useState('20000');
  const [name, setName] = useState(''); const [w, setW] = useState(''); const [h, setH] = useState('');
  useEffect(() => { getKV<{ ds: Device[]; wh: number }>('energy', { ds: [], wh: 74 }).then((x) => { setDs(x.ds); setWh(x.wh); }); }, []);
  const save = (d: Device[], c: number) => { setDs(d); setWh(c); void setKV('energy', { ds: d, wh: c }); };
  const r = energyReport(ds, wh);
  return (
    <main class="stack"><h1>{t('energy.title')}</h1><p class="muted">{t('energy.hint')}</p>
      <section class="card stack"><label class="row"><span style="flex:1">{t('energy.capacity')}</span><input type="number" value={wh} min="0" style="inline-size:7rem" onInput={(e) => save(ds, Number((e.target as HTMLInputElement).value) || 0)} /></label>
        <label class="row"><span style="flex:1">{t('energy.mah')}</span><input type="number" value={mah} style="inline-size:7rem" onInput={(e) => setMah((e.target as HTMLInputElement).value)} /><button onClick={() => save(ds, +mahToWh(Number(mah)).toFixed(1))}>{t('dist.apply')}</button></label></section>
      <section class="card"><div class="big-num">{Number.isFinite(r.days) ? r.days.toFixed(1) : '∞'} {t('stock.daysleft')}</div><p class="muted">{t('energy.daily', { n: r.daily.toFixed(1), u: r.usable.toFixed(1) })}</p></section>
      <ul class="list">{ds.map((d, i) => <li class="card row"><span style="flex:1">{d.name} · {d.watts} W × {d.hours} h = {(d.watts * d.hours).toFixed(1)} Wh ({Math.round(r.shares[i].pct * 100)}%)</span><button onClick={() => save(ds.filter((_, j) => j !== i), wh)} aria-label={t('common.delete')}>🗑</button></li>)}</ul>
      <section class="card stack"><h2>{t('energy.add')}</h2><input value={name} onInput={(e) => setName((e.target as HTMLInputElement).value)} placeholder={t('inv.name')} aria-label={t('inv.name')} />
        <div class="row"><input type="number" value={w} placeholder="W" aria-label="W" style="inline-size:6rem" onInput={(e) => setW((e.target as HTMLInputElement).value)} /><input type="number" value={h} placeholder={t('energy.hours')} aria-label={t('energy.hours')} onInput={(e) => setH((e.target as HTMLInputElement).value)} /></div>
        <button disabled={!name.trim() || !(Number(w) > 0) || !(Number(h) > 0)} onClick={() => { save([...ds, { name: name.trim(), watts: Number(w), hours: Number(h) }], wh); setName(''); setW(''); setH(''); }}>{t('family.add')}</button></section>
    </main>
  );
}
