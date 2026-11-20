import { useState } from 'preact/hooks';
import { t } from '../../i18n';
import { convert, UNITS, type Category } from '../../lib/units';
import { bmi, discount, loanPayment, compound, dateDiff, addDays, radix, convertWithRate } from '../../lib/tools2';

type Special = 'currency' | 'finance' | 'date' | 'discount' | 'radix' | 'bmi';
type View = Category | Special;
const HUB: Array<[View, string]> = [['currency', '💱'], ['length', '📏'], ['mass', '⚖️'], ['area', '⬛'], ['time', '🕒'], ['finance', '💰'], ['data', '💾'], ['date', '📅'], ['discount', '🏷️'], ['volume', '🧊'], ['radix', '🔢'], ['speed', '🏎️'], ['temperature', '🌡️'], ['bmi', '🧍'], ['pressure', '🌀']];
const num = (v: string) => Number(v.replace(',', '.'));
const fmtN = (n: number | null | undefined, d = 2) => (n == null || !Number.isFinite(n) ? '—' : n.toLocaleString(undefined, { maximumFractionDigits: d }));
const field = (label: string, v: string, set: (s: string) => void, type: 'text' | 'number' | 'date' = 'text') => <label class="stack"><span class="muted">{label}</span><input type="text" inputMode={type === 'number' ? 'decimal' : undefined} value={v} dir="ltr" onInput={(e) => set((e.target as HTMLInputElement).value)} /></label>;

function UnitView({ cat }: { cat: Category }) {
  const units = Object.keys(UNITS[cat]); const [from, setFrom] = useState(units[0]); const [to, setTo] = useState(units[1] ?? units[0]); const [v, setV] = useState('1');
  const out = convert(cat, from, to, num(v));
  const opts = (sel: string, on: (x: string) => void) => <select value={sel} onChange={(e) => on((e.target as HTMLSelectElement).value)}>{units.map((u) => <option value={u}>{u}</option>)}</select>;
  return (<div class="stack"><div class="row"><input type="text" inputMode="decimal" dir="ltr" value={v} onInput={(e) => setV((e.target as HTMLInputElement).value)} aria-label={t('conv.value')} />{opts(from, setFrom)}</div>
    <div class="row"><span>=</span><strong class="big-num" dir="ltr">{Number.isFinite(out) ? +out.toPrecision(7) : '—'}</strong>{opts(to, setTo)}</div></div>);
}
function Currency() {
  const [a, setA] = useState('100'); const [r, setR] = useState('5.00'); const out = convertWithRate(num(a), num(r));
  return (<div class="stack"><p class="muted">{t('conv.cur.note')}</p>{field(t('conv.cur.amount'), a, setA)}{field(t('conv.cur.rate'), r, setR)}<div class="big-num" dir="ltr">{fmtN(out)}</div></div>);
}
function Finance() {
  const [mode, setMode] = useState<'loan' | 'compound'>('loan'); const [p, setP] = useState('10000'); const [rate, setRate] = useState('12'); const [n, setN] = useState('12');
  const loan = mode === 'loan' ? loanPayment(num(p), num(rate), Math.round(num(n))) : null; const comp = mode === 'compound' ? compound(num(p), num(rate), num(n)) : null;
  return (<div class="stack"><div class="row"><button class={`btn${mode === 'loan' ? ' primary' : ''}`} onClick={() => setMode('loan')}>{t('conv.fin.loan')}</button><button class={`btn${mode === 'compound' ? ' primary' : ''}`} onClick={() => setMode('compound')}>{t('conv.fin.compound')}</button></div>
    {field(t('conv.fin.principal'), p, setP)}{field(t('conv.fin.rate'), rate, setRate)}{field(mode === 'loan' ? t('conv.fin.months') : t('conv.fin.years'), n, setN)}
    {mode === 'loan' ? <ul class="list"><li class="card">{t('conv.fin.monthly')}: <b dir="ltr">{fmtN(loan?.monthly)}</b></li><li class="card">{t('conv.fin.total')}: <b dir="ltr">{fmtN(loan?.total)}</b></li><li class="card">{t('conv.fin.interest')}: <b dir="ltr">{fmtN(loan?.interest)}</b></li></ul>
      : <ul class="list"><li class="card">{t('conv.fin.final')}: <b dir="ltr">{fmtN(comp?.final)}</b></li><li class="card">{t('conv.fin.gain')}: <b dir="ltr">{fmtN(comp?.gain)}</b></li></ul>}</div>);
}
const today = () => new Date().toISOString().slice(0, 10);
function DateView() {
  const [a, setA] = useState(today()); const [b, setB] = useState(today()); const [n, setN] = useState('30'); const d = dateDiff(a, b); const plus = addDays(a, num(n));
  return (<div class="stack"><h2>{t('conv.date.diff')}</h2><label class="stack"><span class="muted">{t('conv.date.from')}</span><input type="date" value={a} onInput={(e) => setA((e.target as HTMLInputElement).value)} /></label><label class="stack"><span class="muted">{t('conv.date.to')}</span><input type="date" value={b} onInput={(e) => setB((e.target as HTMLInputElement).value)} /></label>
    {d && <p class="card" dir="auto"><b>{t('conv.date.days', { n: d.days })}</b><br />{t('conv.date.span', { y: d.years, m: d.months, d: d.rest })}</p>}
    <h2>{t('conv.date.add')}</h2>{field(t('conv.date.n'), n, setN)}<p class="card" dir="ltr"><b>{plus ?? '—'}</b></p></div>);
}
function Discount() {
  const [p, setP] = useState('200'); const [pc, setPc] = useState('25'); const r = discount(num(p), num(pc));
  return (<div class="stack">{field(t('conv.disc.price'), p, setP)}{field(t('conv.disc.pct'), pc, setPc)}<ul class="list"><li class="card">{t('conv.disc.final')}: <b dir="ltr">{fmtN(r?.final)}</b></li><li class="card">{t('conv.disc.saved')}: <b dir="ltr">{fmtN(r?.saved)}</b></li></ul></div>);
}
function Radix() {
  const [v, setV] = useState('255'); const [b, setB] = useState<2 | 8 | 10 | 16>(10); const r = radix(v, b);
  return (<div class="stack">{field(t('conv.radix.in'), v, setV)}<div class="row">{([2, 8, 10, 16] as const).map((x) => <button class={`btn${b === x ? ' primary' : ''}`} onClick={() => setB(x)}>{x}</button>)}</div>
    {r ? <ul class="list" dir="ltr">{(['bin', 'oct', 'dec', 'hex'] as const).map((k) => <li class="card" style="word-break:break-all"><span class="muted">{k.toUpperCase()}</span> <b>{r[k]}</b></li>)}</ul> : <p class="danger-box">{t('conv.radix.bad')}</p>}</div>);
}
function Bmi() {
  const [kg, setKg] = useState('70'); const [cm, setCm] = useState('175'); const r = bmi(num(kg), num(cm));
  return (<div class="stack">{field(t('conv.bmi.kg'), kg, setKg)}{field(t('conv.bmi.cm'), cm, setCm)}{r && <div class="card stack"><div class="big-num" dir="ltr">{r.value.toFixed(1)}</div><b>{t(`conv.bmi.${r.cls}`)}</b></div>}<p class="muted">{t('conv.bmi.note')}</p></div>);
}
export function ConverterHub() {
  const [view, setView] = useState<View | null>(null);
  if (!view) return (<div class="stack"><div class="grid2" style="grid-template-columns:repeat(3,1fr)">{HUB.map(([k, i]) => <button class="btn tool" onClick={() => setView(k)}><span class="ico" aria-hidden="true">{i}</span><span>{t(`conv.cat.${k}`)}</span></button>)}</div></div>);
  return (<div class="stack"><button class="btn" onClick={() => setView(null)}>‹ {t('conv.back')}</button><h2>{t(`conv.cat.${view}`)}</h2>
    {view === 'currency' ? <Currency /> : view === 'finance' ? <Finance /> : view === 'date' ? <DateView /> : view === 'discount' ? <Discount /> : view === 'radix' ? <Radix /> : view === 'bmi' ? <Bmi /> : <UnitView cat={view} />}</div>);
}
/** Route `#/tools/converter`: the converter hub on its own page. */
export const Converter = () => (<main class="stack"><h1>{t('converter.title')}</h1><ConverterHub /></main>);
