import privacy from '../../../docs/PRIVACY.md?raw';
import terms from '../../../docs/TERMS.md?raw';
import { t } from '../../i18n';
import { useSettings } from '../../db/settings';
import { href } from '../../router';

/** Picks the "## English" or "## Português" section (Portuguese for pt, English for everything else: legal texts are not machine-translated). */
function section(md: string, pt: boolean): string[] {
  const parts = md.split(/^## /m); const want = pt ? 'Português' : 'English';
  return (parts.find((p) => p.startsWith(want)) ?? '').split('\n').slice(1).filter((l) => l.trim());
}
const inline = (s: string) => s.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((x) => (x.startsWith('**') ? <strong>{x.slice(2, -2)}</strong> : x.startsWith('*') ? <em>{x.slice(1, -1)}</em> : x));
export function Legal({ doc }: { doc: 'privacy' | 'terms' }) {
  const s = useSettings();
  const lines = section(doc === 'privacy' ? privacy : terms, s.locale === 'pt');
  return (
    <main class="stack">
      <h1>{t(doc === 'privacy' ? 'legal.privacy' : 'legal.terms')}</h1>
      <p class="danger-box">{t('about.draft')}</p>
      {lines.map((l) => <p>{inline(l)}</p>)}
      <a class="btn" href={href('legal', doc === 'privacy' ? 'terms' : 'privacy')}>{t(doc === 'privacy' ? 'legal.terms' : 'legal.privacy')}</a>
    </main>
  );
}
