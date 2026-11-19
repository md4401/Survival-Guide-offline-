import { useEffect, useState } from 'preact/hooks';
import { t } from '../../i18n';
import { getKV, setKV } from '../../db/dexie';
import { useSettings } from '../../db/settings';
import { stockReport, KCAL_PER_PERSON_DAY, type StockItem } from '../../lib/stock';

export function Stock() {
  const s = useSettings(); const [items, setItems] = useState<StockItem[]>([]); const [people, setPeople] = useState(s.profile.people); const [days, setDays] = useState(7); const [need, setNeed] = useState(KCAL_PER_PERSON_DAY);
  const [name, setName] = useState(''); const [qty, setQty] = useState('1'); const [kcal, setKcal] = useState('');
  useEffect(() => { getKV<StockItem[]>('stock', []).then(setItems); }, []);
  const save = (x: StockItem[]) => { setItems(x); void setKV('stock', x); };
  const r = stockReport(items, people, days, need);
  const num = (label: string, v: number, set: (n: number) => void, min = 1, max = 365) => <label class="row"><span style="flex:1">{label}</span><button onClick={() => set(Math.max(min, v - 1))} aria-label="-">−</button><strong>{v}</strong><button onClick={() => set(Math.min(max, v + 1))} aria-label="+">+</button></label>;
  return (
    <main class="stack"><h1>{t('stock.title')}</h1><p class="danger-box">{t('stock.hint')}</p>
      {num(t('kit.people'), people, setPeople, 1, 30)}{num(t('kit.days'), days, setDays)}
      <label class="row"><span style="flex:1">{t('stock.need')}</span><input type="number" value={need} min="500" max="5000" style="inline-size:6rem" onInput={(e) => setNeed(Number((e.target as HTMLInputElement).value) || KCAL_PER_PERSON_DAY)} /></label>
      <section class="card"><div class="big-num">{Number.isFinite(r.days) ? r.days.toFixed(1) : '0'} {t('stock.daysleft')}</div>
        <p>{r.enough ? t('stock.enough', { d: days }) : t('stock.missing', { k: Math.round(r.deficit).toLocaleString(s.locale) })}</p></section>
      <ul class="list">{items.map((i, n) => <li class="card row"><span style="flex:1">{i.name} · {i.qty} × {i.kcalPerUnit} kcal</span><button onClick={() => save(items.filter((_, j) => j !== n))} aria-label={t('common.delete')}>🗑</button></li>)}</ul>
      <section class="card stack"><h2>{t('stock.add')}</h2>
        <input value={name} onInput={(e) => setName((e.target as HTMLInputElement).value)} placeholder={t('inv.name')} aria-label={t('inv.name')} />
        <div class="row"><input type="number" value={qty} min="0" step="any" style="inline-size:6rem" onInput={(e) => setQty((e.target as HTMLInputElement).value)} aria-label={t('inv.qty')} />
          <input type="number" value={kcal} min="0" placeholder={t('stock.kcal')} aria-label={t('stock.kcal')} onInput={(e) => setKcal((e.target as HTMLInputElement).value)} /></div>
        <button disabled={!name.trim() || !(Number(kcal) > 0)} onClick={() => { save([...items, { name: name.trim(), qty: Number(qty) || 1, kcalPerUnit: Number(kcal) }]); setName(''); setKcal(''); }}>{t('family.add')}</button></section>
    </main>
  );
}
