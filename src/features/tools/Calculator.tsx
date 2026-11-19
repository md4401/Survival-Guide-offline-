import { useState } from 'preact/hooks';
import { t, } from '../../i18n';
import { evaluate, fmt, CalcError } from '../../lib/calc';
import { useSettings } from '../../db/settings';

const KEYS = ['7', '8', '9', '÷', '4', '5', '6', '×', '1', '2', '3', '−', '0', ',', '%', '+', '(', ')', '^', '√'];
export function Calculator() {
  const s = useSettings(); const [expr, setExpr] = useState(''); const [res, setRes] = useState(''); const [err, setErr] = useState(''); const [hist, setHist] = useState<string[]>([]); const [mem, setMem] = useState(0);
  const run = () => { try { const v = fmt(evaluate(expr), s.locale); setHist([`${expr} = ${v}`, ...hist].slice(0, 8)); setRes(v); setErr(''); } catch (e) { setErr(t(`calc.err.${e instanceof CalcError ? e.message : 'syntax'}`)); } };
  const add = (k: string) => { setExpr(expr + k); setErr(''); };
  return (
    <main class="stack"><h1>{t('calc.title')}</h1>
      <input dir="ltr" inputMode="decimal" value={expr} onInput={(e) => setExpr((e.target as HTMLInputElement).value)} onKeyDown={(e) => e.key === 'Enter' && run()} aria-label={t('calc.expr')} placeholder="2+3×4" style="font-size:1.6rem" />
      <div class="big-num" dir="ltr" aria-live="polite">{res || '0'}</div>{err && <p class="danger-box" role="alert">{err}</p>}
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:.5rem" dir="ltr">
        {KEYS.map((k) => <button class="btn" onClick={() => add(k)}>{k}</button>)}
        <button class="btn" onClick={() => { setExpr(''); setRes(''); setErr(''); }}>C</button>
        <button class="btn" onClick={() => setExpr(expr.slice(0, -1))} aria-label={t('calc.back')}>⌫</button>
        <button class="btn" onClick={() => add('π')}>π</button>
        <button class="btn primary" onClick={run}>=</button></div>
      <div class="row"><button class="btn" onClick={() => { try { setMem(evaluate(expr || res || '0')); } catch { setErr(t('calc.err.syntax')); } }}>M+ ({fmt(mem, s.locale)})</button>
        <button class="btn" onClick={() => add(fmt(mem, s.locale))}>MR</button><button class="btn" onClick={() => setMem(0)}>MC</button></div>
      {hist.length > 0 && <section class="card stack"><h2>{t('calc.history')}</h2><ul class="list">{hist.map((h) => <li dir="ltr">{h}</li>)}</ul></section>}</main>
  );
}
