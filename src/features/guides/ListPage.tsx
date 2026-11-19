import { useEffect, useState } from 'preact/hooks';
import type { Guide, Kind } from '../../content/types';
import { loadGuides } from '../../content/loader';
import { t } from '../../i18n';
import { href } from '../../router';
import { useSettings } from '../../db/settings';

export function ListPage({ kind, titleKey }: { kind: Kind; titleKey: string }) {
  const s = useSettings();
  const [items, setItems] = useState<Guide[] | null>(null);
  useEffect(() => { loadGuides().then((r) => setItems(r.guides.filter((g) => g.kind === kind))); }, [kind, s.locale, s.dev]);
  return (
    <main class="stack">
      <h1>{t(titleKey)}</h1>
      {items === null ? <p>{t('app.loading')}</p> : items.length === 0 ? <p class="muted">{t('list.empty')}</p> : (
        <ul class="list">
          {items.map((g) => (
            <li><a class="btn" href={href('guide', g.id)}>
              {g.vital ? '❗ ' : ''}{g.title}{g.status === 'draft' ? ` · ${t('review.draft')}` : ''}
            </a></li>
          ))}
        </ul>
      )}
    </main>
  );
}
