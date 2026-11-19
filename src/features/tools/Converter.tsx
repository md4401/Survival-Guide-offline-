import { useState } from 'preact/hooks';
import { t } from '../../i18n';
import { convert, UNITS, type Category } from '../../lib/units';

export function Converter() {
  const [cat, setCat] = useState<Category>('temperature');
  const units = Object.keys(UNITS[cat]);
  const [from, setFrom] = useState('C'); const [to, setTo] = useState('F'); const [v, setV] = useState('0');
  const pick = (c: Category) => { const u = Object.keys(UNITS[c]); setCat(c); setFrom(u[0]); setTo(u[1] ?? u[0]); };
  const out = convert(cat, from, to, Number(v));
  const opts = (sel: string, on: (x: string) => void) => <select value={sel} onChange={(e) => on((e.target as HTMLSelectElement).value)}>{units.map((u) => <option value={u}>{u}</option>)}</select>;
  return (
    <main class="stack">
      <h1>{t('converter.title')}</h1>
      <select value={cat} onChange={(e) => pick((e.target as HTMLSelectElement).value as Category)} aria-label={t('converter.title')}>
        {(Object.keys(UNITS) as Category[]).map((c) => <option value={c}>{t(`conv.cat.${c}`)}</option>)}
      </select>
      <div class="row"><input type="number" inputMode="decimal" value={v} onInput={(e) => setV((e.target as HTMLInputElement).value)} aria-label={t('conv.value')} />{opts(from, setFrom)}</div>
      <div class="row"><span>=</span><strong class="big-num">{Number.isFinite(out) ? +out.toPrecision(7) : '—'}</strong>{opts(to, setTo)}</div>
    </main>
  );
}
