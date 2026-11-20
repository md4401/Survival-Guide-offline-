import { useState } from 'preact/hooks';
import { t } from '../../i18n';
import { evaluate, fmt, CalcError } from '../../lib/calc';
import { useSettings } from '../../db/settings';
import { ConverterHub } from './Converter';

type Key = { l: string; ins?: string; act?: string; cls?: string; aria?: string };
export function CalcApp({ tab: first = 'calc' }: { tab?: 'calc' | 'conv' }) {
  const [tab, setTab] = useState(first);
  return (
    <main class="stack">
      <div class="row" role="tablist" style="flex-wrap:nowrap">
        <button role="tab" aria-selected={tab === 'calc'} class={`btn${tab === 'calc' ? ' primary' : ''}`} style="flex:1" onClick={() => setTab('calc')}>{t('calc.title')}</button>
        <button role="tab" aria-selected={tab === 'conv'} class={`btn${tab === 'conv' ? ' primary' : ''}`} style="flex:1" onClick={() => setTab('conv')}>{t('converter.title')}</button>
      </div>
      {tab === 'calc' ? <Calculator onConvert={() => setTab('conv')} /> : <ConverterHub />}
    </main>
  );
}
export const Calculator = ({ onConvert }: { onConvert?: () => void }) => <CalcBody onConvert={onConvert ?? (() => {})} />;

function CalcBody({ onConvert }: { onConvert: () => void }) {
  const s = useSettings(); const [expr, setExpr] = useState(''); const [res, setRes] = useState(''); const [err, setErr] = useState(''); const [hist, setHist] = useState<Array<[string, string]>>([]); const [deg, setDeg] = useState(true); const [inv, setInv] = useState(false);
  const preview = (() => { if (!expr || res) return ''; try { return fmt(evaluate(expr, { deg }), s.locale); } catch { return ''; } })();
  const run = () => { try { const v = fmt(evaluate(expr, { deg }), s.locale); setHist([[expr, v] as [string, string], ...hist].slice(0, 12)); setRes(v); setErr(''); } catch (e) { setErr(t(`calc.err.${e instanceof CalcError ? e.message : 'syntax'}`)); } };
  const add = (k: string) => { if (res) { setExpr(/^[+\-×÷^%!)]/.test(k) ? res + k : k); setRes(''); } else setExpr(expr + k); setErr(''); };
  const act = (a: string) => {
    if (a === 'ac') { setExpr(''); setRes(''); setErr(''); } else if (a === 'bs') { if (res) { setRes(''); } else setExpr(expr.slice(0, -1)); setErr(''); }
    else if (a === 'eq') run(); else if (a === '2nd') setInv(!inv); else if (a === 'deg') setDeg(!deg); else if (a === 'conv') onConvert();
    else if (a === 'recip') { const base = res || expr; setExpr(`1/(${base || ''}`.replace(/\($/, '(') + (base ? ')' : '')); setRes(''); }
  };
  const rows: Key[][] = [
    [{ l: '2nd', act: '2nd', cls: inv ? 'primary' : '' }, { l: deg ? 'deg' : 'rad', act: 'deg' }, { l: inv ? 'sin⁻¹' : 'sin', ins: inv ? 'asin(' : 'sin(' }, { l: inv ? 'cos⁻¹' : 'cos', ins: inv ? 'acos(' : 'cos(' }, { l: inv ? 'tan⁻¹' : 'tan', ins: inv ? 'atan(' : 'tan(' }],
    [{ l: 'xʸ', ins: '^' }, { l: inv ? '10ˣ' : 'lg', ins: inv ? '10^(' : 'lg(' }, { l: inv ? 'eˣ' : 'ln', ins: inv ? 'exp(' : 'ln(' }, { l: '(', ins: '(' }, { l: ')', ins: ')' }],
    [{ l: '√x', ins: '√(' }, { l: 'AC', act: 'ac', cls: 'op' }, { l: '⌫', act: 'bs', cls: 'op', aria: t('calc.back') }, { l: '%', ins: '%', cls: 'op' }, { l: '÷', ins: '÷', cls: 'op' }],
    [{ l: 'x!', ins: '!' }, { l: '7', ins: '7' }, { l: '8', ins: '8' }, { l: '9', ins: '9' }, { l: '×', ins: '×', cls: 'op' }],
    [{ l: '1/x', act: 'recip' }, { l: '4', ins: '4' }, { l: '5', ins: '5' }, { l: '6', ins: '6' }, { l: '−', ins: '−', cls: 'op' }],
    [{ l: 'π', ins: 'π' }, { l: '1', ins: '1' }, { l: '2', ins: '2' }, { l: '3', ins: '3' }, { l: '+', ins: '+', cls: 'op' }],
    [{ l: '⇄', act: 'conv', aria: t('converter.title') }, { l: 'e', ins: 'e' }, { l: '0', ins: '0' }, { l: ',', ins: ',' }, { l: '=', act: 'eq', cls: 'primary' }],
  ];
  return (
    <div class="stack">
      <div class="card" dir="ltr" style="min-block-size:7rem;max-block-size:9rem;overflow:auto;text-align:end" aria-label={t('calc.history')}>
        {hist.length === 0 ? <span class="muted">{t('calc.history.empty')}</span> : [...hist].reverse().map(([e, v]) => <div class="muted"><button class="btn" style="min-block-size:32px;border:0;background:none;box-shadow:none;backdrop-filter:none" onClick={() => { setExpr(v); setRes(''); }}>{e} = {v}</button></div>)}
      </div>
      <input dir="ltr" inputMode="none" value={expr} onInput={(e) => { setExpr((e.target as HTMLInputElement).value); setRes(''); }} onKeyDown={(e) => e.key === 'Enter' && run()} aria-label={t('calc.expr')} placeholder="0" style="font-size:1.8rem;text-align:end" />
      <div class="big-num" dir="ltr" aria-live="polite" style="text-align:end;min-block-size:1.2em">{res || (preview ? <span class="muted">{preview}</span> : '0')}</div>
      {err && <p class="danger-box" role="alert">{err}</p>}
      <div dir="ltr" style="display:grid;grid-template-columns:repeat(5,1fr);gap:.4rem">
        {rows.flat().map((k) => <button class={`btn${k.cls === 'primary' ? ' primary' : ''}`} aria-label={k.aria} style={k.cls === 'op' ? 'color:var(--accent);font-weight:800' : 'padding-inline:.25rem'} onClick={() => (k.act ? act(k.act) : add(k.ins!))}>{k.l}</button>)}
      </div>
    </div>
  );
}
