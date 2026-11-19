import { useEffect, useState } from 'preact/hooks';
import { t } from '../../i18n';
import { useSettings } from '../../db/settings';
import { db } from '../../db/dexie';
import { checkKey, plan, progress, NEEDS_REVIEW, type Cat } from '../../data/kits';

const CATS: Cat[] = ['water', 'food', 'health', 'energy', 'comms', 'shelter', 'docs'];

export function Kit({ kit }: { kit: string }) {
  const s = useSettings();
  const p = s.profile;
  const [people, setPeople] = useState(p.people);
  const [days, setDays] = useState(kit === '72h' ? 3 : 1);
  const [done, setDone] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(false);
  useEffect(() => { db.checklists.toArray().then((r) => setDone(new Set(r.filter((x) => x.done).map((x) => x.key)))).catch(() => {}); }, []);
  const needs = { people, days, kids: p.kids, elderly: p.elderly, pets: p.pets };
  const items = plan(kit, needs);
  const toggle = async (key: string) => {
    const next = new Set(done); const on = !next.has(key);
    on ? next.add(key) : next.delete(key); setDone(next);
    try { await db.checklists.put({ key, done: on }); } catch { /* storage unavailable */ }
  };
  const missing = items.filter((x) => !done.has(checkKey(kit, x.item.id)));
  const line = (x: (typeof items)[number]) => `- ${t(`kit.item.${x.item.id}`)}: ${x.qty} ${t(`kit.unit.${x.item.unit ?? 'pcs'}`)}`;
  const copy = async () => { try { await navigator.clipboard.writeText(missing.map(line).join('\n')); setCopied(true); } catch { /* ignore */ } };
  const num = (v: number, set: (n: number) => void, max: number, label: string) => (
    <label class="row"><span>{label}</span>
      <button onClick={() => set(Math.max(1, v - 1))} aria-label="-">−</button><strong>{v}</strong><button onClick={() => set(Math.min(max, v + 1))} aria-label="+">+</button>
    </label>
  );
  return (
    <main class="stack">
      <h1>{t(`kit.title.${kit}`)}</h1>
      {NEEDS_REVIEW && <p class="danger-box">{t('kit.review')}</p>}
      {num(people, setPeople, 20, t('kit.people'))}
      {kit === '72h' && num(days, setDays, 30, t('kit.days'))}
      <p><span class="badge">{t('kit.progress', { p: progress(kit, needs, done) })}</span></p>
      {CATS.map((c) => {
        const rows = items.filter((x) => x.item.cat === c);
        return rows.length === 0 ? null : (
          <section class="card" key={c}>
            <h2>{t(`kit.cat.${c}`)}</h2>
            <ul class="list">
              {rows.map((x) => {
                const key = checkKey(kit, x.item.id);
                return (
                  <li>
                    <label class="row" style="min-block-size:var(--tap)">
                      <input type="checkbox" checked={done.has(key)} onChange={() => toggle(key)} style="inline-size:28px;block-size:28px" />
                      <span style="flex:1">{t(`kit.item.${x.item.id}`)}{x.item.when && <span class="muted"> · {t(`kit.why.${x.item.when}`)}</span>}</span>
                      <strong>{x.qty} {t(`kit.unit.${x.item.unit ?? 'pcs'}`)}</strong>
                    </label>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
      <button class="btn-block" onClick={copy} disabled={missing.length === 0}>{copied ? t('kit.copied') : t('kit.copy')}</button>
    </main>
  );
}
