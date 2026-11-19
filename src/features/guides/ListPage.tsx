import { useEffect, useMemo, useState } from 'preact/hooks';
import type { Guide, Kind } from '../../content/types';
import { loadGuides } from '../../content/loader';
import { t } from '../../i18n';
import { href } from '../../router';
import { useSettings } from '../../db/settings';
import { useUserLists } from './Search';
import { filterGuides, groupByCategory, categoryCounts, sortScenarios, SCENARIO_ICON } from '../../lib/list';

const Badges = ({ g }: { g: Guide }) => (
  <span class="muted">
    {g.vital && <span class="badge">❗ {t('guide.vital')}</span>}{' '}
    {g.minutes > 0 && <span>{t('common.minutes', { n: g.minutes })}</span>}{' '}
    {g.status === 'draft' && <span>· {t('review.draft')}</span>}
  </span>
);

function Scenarios({ items }: { items: Guide[] }) {
  return (
    <main class="stack"><h1>{t('list.scenarios')}</h1><p class="muted">{t('list.scenarios.intro')}</p>
      <div class="grid2">
        <a class="btn btn-danger" href={href('triage')}>🆘 {t('plan72.a.triage')}</a>
        <a class="btn" href={href('crisis')}>🚨 {t('crisis.title')}</a>
      </div>
      {items.length === 0 ? <p class="muted">{t('list.empty')}</p> : (
        <ul class="grid2 list">{sortScenarios(items).map((g) => (
          <li><a class="btn card stack" href={href('guide', g.id)} style="block-size:100%;align-items:flex-start;text-align:start">
            <span style="font-size:2rem" aria-hidden="true">{SCENARIO_ICON[g.id] ?? '⚠️'}</span><b>{g.title}</b>
            <span class="muted">{g.summary}</span><Badges g={g} /></a></li>
        ))}</ul>
      )}
    </main>
  );
}

export function ListPage({ kind, titleKey }: { kind: Kind; titleKey: string }) {
  const s = useSettings(); const { favs, hist } = useUserLists();
  const [items, setItems] = useState<Guide[] | null>(null); const [q, setQ] = useState(''); const [cat, setCat] = useState('');
  useEffect(() => { loadGuides().then((r) => setItems(r.guides.filter((g) => g.kind === kind))); }, [kind, s.locale, s.dev]);
  const shown = useMemo(() => filterGuides(items ?? [], q, cat), [items, q, cat]);
  const groups = useMemo(() => groupByCategory(shown), [shown]);
  const counts = useMemo(() => categoryCounts(items ?? []), [items]);
  if (items === null) return <main><p>{t('app.loading')}</p></main>;
  if (kind === 'scenario') return <Scenarios items={items} />;
  const byId = new Map(items.map((g) => [g.id, g]));
  const quick = [...favs.map((id) => ['★', id] as const), ...hist.filter((id) => !favs.includes(id)).map((id) => ['🕘', id] as const)].filter(([, id]) => byId.has(id)).slice(0, 6);
  return (
    <main class="stack"><h1>{t(titleKey)}</h1>
      {items.length === 0 ? <p class="muted">{t('list.empty')}</p> : <>
        <input type="search" value={q} onInput={(e) => setQ((e.target as HTMLInputElement).value)} placeholder={t('list.filter')} aria-label={t('list.filter')} />
        <div class="row" style="flex-wrap:wrap">
          <button class={`btn${cat === '' ? ' primary' : ''}`} onClick={() => setCat('')}>{t('list.all')} ({items.length})</button>
          {counts.map(([c, n]) => <button class={`btn${cat === c ? ' primary' : ''}`} onClick={() => setCat(cat === c ? '' : c)}>{t(`cat.${c}`)} ({n})</button>)}
        </div>
        {!q && !cat && quick.length > 0 && <section class="card stack"><h2>{t('list.quick')}</h2><ul class="list">{quick.map(([i, id]) => <li><a class="btn" href={href('guide', id)}>{i} {byId.get(id)!.title}</a></li>)}</ul></section>}
        <p class="muted" role="status">{t('list.count', { n: shown.length })}</p>
        {shown.length === 0 ? <p class="muted">{t('list.none')}</p> : groups.map((gr) => (
          <section class="stack"><h2>{t(`cat.${gr.category}`)}</h2>
            <ul class="list">{gr.items.map((g) => <li><a class="btn stack" href={href('guide', g.id)} style="align-items:flex-start;text-align:start"><b>{g.title}</b><span class="muted">{g.summary}</span><Badges g={g} /></a></li>)}</ul></section>
        ))}
      </>}
    </main>
  );
}
