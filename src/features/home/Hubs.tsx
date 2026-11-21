import { useEffect, useState } from 'preact/hooks';
import { t } from '../../i18n';
import { href } from '../../router';
import { loadGuides } from '../../content/loader';
import { useSettings } from '../../db/settings';
import { categoryCounts } from '../../lib/list';
import type { Guide } from '../../content/types';

export const CAT_ICON: Record<string, string> = {
  firstaid: '🩹', shelter: '🏕️', water: '💧', food: '🍲', fire: '🔥', nav: '🧭', nature: '🌲', tools: '🪢', weather: '⛅', comms: '📡', prepare: '🎒', disaster: '🌪️',
  family: '👨‍👩‍👧', hygiene: '🧼', mental: '🧠', health: '❤️', travel: '🚗', urban: '🏙️', security: '🔒', energy: '🔋', myths: '❓', curiosities: '💡', scenarios: '⚠️',
};

/** Everything you can read or learn, in one place. */
export function ExploreHub() {
  const s = useSettings(); const [all, setAll] = useState<Guide[] | null>(null);
  useEffect(() => { loadGuides().then((r) => setAll(r.guides)); }, [s.locale, s.dev]);
  const guides = (all ?? []).filter((g) => g.kind === 'guide'); const scen = (all ?? []).filter((g) => g.kind === 'scenario');
  const cats = categoryCounts(guides);
  return (
    <main class="stack"><h1>{t('explore.title')}</h1>
      <a class="btn search-bar" href={href('search')}>🔍 <span>{t('explore.search')}</span></a>
      <div class="grid2">
        <a class="btn hub-card hub-danger" href={href('scenarios')}><span class="ico" aria-hidden="true">⚠️</span><b>{t('nav.scenarios')}</b><span class="muted">{t('explore.scenarios.sub')}</span>{all && <span class="count">{scen.length}</span>}</a>
        <a class="btn hub-card" href={href('guides')}><span class="ico" aria-hidden="true">📖</span><b>{t('nav.guides')}</b><span class="muted">{t('explore.guides.sub')}</span>{all && <span class="count">{guides.length}</span>}</a>
        <a class="btn hub-card" href={href('learn')}><span class="ico" aria-hidden="true">🎓</span><b>{t('learn.title')}</b><span class="muted">{t('explore.learn.sub')}</span></a>
        <a class="btn hub-card" href={href('library')}><span class="ico" aria-hidden="true">📚</span><b>{t('explore.library')}</b><span class="muted">{t('explore.library.sub')}</span></a>
      </div>
      <h2>{t('explore.categories')}</h2>
      {all === null ? <p class="muted">{t('app.loading')}</p> : (
        <div class="grid3">{cats.map(([c, n]) => <a class="btn cat-tile" href={href('guides', c)}><span class="ico" aria-hidden="true">{CAT_ICON[c] ?? '📄'}</span><span>{t(`cat.${c}`)}</span><span class="muted">{n}</span></a>)}</div>
      )}
    </main>
  );
}

/** Everything else: nearby messages, the world almanac, assistant, settings and information. */
export function MoreHub() {
  const rows: Array<[string, string, string, string]> = [
    ['💬', 'home.messages', 'more.messages.sub', href('messages')],
    ['🌍', 'world.title', 'more.world.sub', href('world')],
    ['🤖', 'ai.title', 'more.ai.sub', href('assistant')],
    ['⚙️', 'settings.title', 'more.settings.sub', href('settings')],
    ['🔄', 'sys.title', 'more.system.sub', href('system')],
    ['⭐', 'plans.title', 'more.plans.sub', href('plans')],
    ['ℹ️', 'about.title', 'more.about.sub', href('about')],
  ];
  return (
    <main class="stack"><h1>{t('more.title')}</h1><p class="muted">{t('more.intro')}</p>
      <ul class="list">{rows.map(([i, k, sub, h]) => <li><a class="btn row-link" href={h}><span class="ico" aria-hidden="true">{i}</span><span class="grow"><b>{t(k)}</b><br /><span class="muted">{t(sub)}</span></span><span class="flip" aria-hidden="true">›</span></a></li>)}</ul>
    </main>
  );
}
