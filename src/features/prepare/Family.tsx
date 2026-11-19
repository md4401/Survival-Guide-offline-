import { useEffect, useState } from 'preact/hooks';
import { t } from '../../i18n';
import { getKV, setKV } from '../../db/dexie';
import { EMPTY_PLAN, mergePlans, sanitizePlan, type FamilyPlan } from '../../lib/family';
import { packText, unpackText, FrameAssembler } from '../../lib/mesh/bundle';
import { MultiQr, QrScanner } from '../../components/Qr';
import { usePremium } from '../../components/PremiumGate';

const P = { raw: 'SGMC0.', zip: 'SGMC1.' };
export function Family() {
  const premium = usePremium();
  const [p, setP] = useState<FamilyPlan>(EMPTY_PLAN); const [name, setName] = useState(''); const [phone, setPhone] = useState('');
  const [code, setCode] = useState(''); const [paste, setPaste] = useState(''); const [msg, setMsg] = useState(''); const [scan, setScan] = useState(false); const [asm] = useState(() => ({ a: new FrameAssembler() }));
  useEffect(() => { getKV<Partial<FamilyPlan>>('familyPlan', {}).then((x) => setP({ ...EMPTY_PLAN, ...x })); }, []);
  const save = (n: FamilyPlan) => { setP(n); void setKV('familyPlan', n); };
  const field = (k: 'near' | 'far' | 'outside' | 'hours', label: string) => <label class="stack"><span>{label}</span><input value={p[k]} onInput={(e) => save({ ...p, [k]: (e.target as HTMLInputElement).value })} /></label>;
  const area = (k: 'routes' | 'roles' | 'kids', label: string) => <label class="stack"><span>{label}</span><textarea rows={3} value={p[k]} onInput={(e) => save({ ...p, [k]: (e.target as HTMLTextAreaElement).value })} style="inline-size:100%" /></label>;
  const share = async () => setCode(await packText({ app: 'sg-family', plan: p }, P));
  const importCode = async (text: string) => {
    try { const j: any = await unpackText(text, P); const o = sanitizePlan(j?.plan); if (!o) throw new Error(); const { plan, added } = mergePlans(p, o); save(plan); setMsg(t('family.qr.ok', { n: added })); setPaste(''); } catch { setMsg(t('msg.invalid')); }
  };
  const onScan = (s: string) => { if (s.startsWith('SGMF1:')) { const r = asm.a.add(s); if (!r.done) return; s = r.text!; asm.a = new FrameAssembler(); } setScan(false); void importCode(s); };
  return (
    <main class="stack printable">
      <h1>{t('prepare.family')}</h1><p class="muted">{t('settings.privacy')}</p>
      {field('near', t('family.near'))}{field('far', t('family.far'))}{field('outside', t('family.outside'))}{field('hours', t('family.hours'))}
      <h2>{t('family.contacts')}</h2>
      <ul class="list">{p.contacts.map((c, i) => <li class="card row"><span style="flex:1">{c.name}</span><a class="btn" href={`tel:${c.phone}`}>{c.phone}</a><button class="no-print" onClick={() => save({ ...p, contacts: p.contacts.filter((_, j) => j !== i) })} aria-label={t('common.delete')}>🗑</button></li>)}</ul>
      <div class="card stack no-print"><input value={name} onInput={(e) => setName((e.target as HTMLInputElement).value)} placeholder={t('family.name')} aria-label={t('family.name')} /><input type="tel" value={phone} onInput={(e) => setPhone((e.target as HTMLInputElement).value)} placeholder={t('family.phone')} aria-label={t('family.phone')} />
        <button onClick={() => { if (name.trim() && phone.trim()) { save({ ...p, contacts: [...p.contacts, { name: name.trim(), phone: phone.trim() }] }); setName(''); setPhone(''); } }}>{t('family.add')}</button></div>
      {premium ? <section class="stack"><h2>{t('family.premium')}</h2>{area('routes', t('family.routes'))}{area('roles', t('family.roles'))}{area('kids', t('family.kids'))}
        <button class="no-print" onClick={() => window.print()}>🖨 {t('family.print')}</button></section> : <p class="muted no-print">{t('gate.soon')}</p>}
      <section class="card stack no-print"><h2>{t('family.qr')}</h2>
        <button onClick={share}>{t('msg.bundle.make')}</button>{code && <><MultiQr text={code} /><textarea readOnly rows={3} value={code} style="inline-size:100%" aria-label={t('family.qr')} onClick={(e) => (e.target as HTMLTextAreaElement).select()} /></>}
        <hr /><textarea rows={2} value={paste} onInput={(e) => setPaste((e.target as HTMLTextAreaElement).value)} placeholder={t('family.qr.paste')} aria-label={t('family.qr.paste')} style="inline-size:100%" />
        <div class="row"><button onClick={() => importCode(paste)} disabled={!paste.trim()}>{t('family.qr.import')}</button><button onClick={() => { asm.a = new FrameAssembler(); setScan(!scan); }}>{scan ? t('msg.scan.stop') : `📷 ${t('msg.bundle.scan')}`}</button></div>
        {scan && <QrScanner onText={onScan} onError={() => setScan(false)} />}{msg && <p role="status">{msg}</p>}</section>
    </main>
  );
}
