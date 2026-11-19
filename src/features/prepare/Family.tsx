import { useEffect, useState } from 'preact/hooks';
import { t } from '../../i18n';
import { getKV, setKV } from '../../db/dexie';

interface Plan { contacts: Array<{ name: string; phone: string }>; near: string; far: string; outside: string; hours: string }
const EMPTY: Plan = { contacts: [], near: '', far: '', outside: '', hours: '' };

export function Family() {
  const [p, setP] = useState<Plan>(EMPTY);
  const [name, setName] = useState(''); const [phone, setPhone] = useState('');
  useEffect(() => { getKV<Plan>('familyPlan', EMPTY).then(setP); }, []);
  const save = (n: Plan) => { setP(n); void setKV('familyPlan', n); };
  const field = (k: 'near' | 'far' | 'outside' | 'hours', label: string) => (
    <label class="stack"><span>{label}</span><input value={p[k]} onInput={(e) => save({ ...p, [k]: (e.target as HTMLInputElement).value })} /></label>
  );
  return (
    <main class="stack">
      <h1>{t('prepare.family')}</h1>
      <p class="muted">{t('settings.privacy')}</p>
      {field('near', t('family.near'))}{field('far', t('family.far'))}{field('outside', t('family.outside'))}{field('hours', t('family.hours'))}
      <h2>{t('family.contacts')}</h2>
      <ul class="list">{p.contacts.map((c, i) => (
        <li class="card row"><span style="flex:1">{c.name}</span><a class="btn" href={`tel:${c.phone}`}>{c.phone}</a>
          <button onClick={() => save({ ...p, contacts: p.contacts.filter((_, j) => j !== i) })} aria-label={t('common.delete')}>🗑</button></li>
      ))}</ul>
      <div class="card stack">
        <input value={name} onInput={(e) => setName((e.target as HTMLInputElement).value)} placeholder={t('family.name')} aria-label={t('family.name')} />
        <input type="tel" value={phone} onInput={(e) => setPhone((e.target as HTMLInputElement).value)} placeholder={t('family.phone')} aria-label={t('family.phone')} />
        <button onClick={() => { if (name.trim() && phone.trim()) { save({ ...p, contacts: [...p.contacts, { name: name.trim(), phone: phone.trim() }] }); setName(''); setPhone(''); } }}>{t('family.add')}</button>
      </div>
    </main>
  );
}
