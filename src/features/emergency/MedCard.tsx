import { useEffect, useState } from 'preact/hooks';
import { t } from '../../i18n';
import { getKV, setKV } from '../../db/dexie';
import { PremiumGate } from '../../components/PremiumGate';

const FIELDS = ['blood', 'allergies', 'meds', 'conditions', 'contact', 'notes'] as const;
type Card = Record<(typeof FIELDS)[number], string>;
const EMPTY: Card = { blood: '', allergies: '', meds: '', conditions: '', contact: '', notes: '' };
function Inner() {
  const [c, setC] = useState<Card>(EMPTY); const [full, setFull] = useState(false);
  useEffect(() => { getKV<Card>('medcard', EMPTY).then((x) => setC({ ...EMPTY, ...x })); }, []);
  const set = (k: keyof Card, v: string) => { const n = { ...c, [k]: v }; setC(n); void setKV('medcard', n); };
  if (full) return <main class="stack" style="font-size:1.3em"><h1>{t('medcard.title')}</h1>{FIELDS.filter((k) => c[k]).map((k) => <div class="card"><div class="muted">{t(`medcard.${k}`)}</div><div style="white-space:pre-wrap;font-weight:700">{c[k]}</div></div>)}<button class="btn-block" onClick={() => setFull(false)}>{t('common.close')}</button></main>;
  return (
    <main class="stack"><h1>{t('medcard.title')}</h1><p class="muted">{t('medcard.hint')}</p>
      {FIELDS.map((k) => <label class="stack"><span>{t(`medcard.${k}`)}</span>{k === 'notes' || k === 'meds' || k === 'conditions' ? <textarea rows={2} value={c[k]} onInput={(e) => set(k, (e.target as HTMLTextAreaElement).value)} style="inline-size:100%" /> : <input value={c[k]} onInput={(e) => set(k, (e.target as HTMLInputElement).value)} />}</label>)}
      <button class="btn-danger btn-block" onClick={() => setFull(true)}>{t('medcard.show')}</button></main>
  );
}
export const MedCard = () => <PremiumGate><Inner /></PremiumGate>;
