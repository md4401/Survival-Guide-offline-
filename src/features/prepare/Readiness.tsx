import { useEffect, useState } from 'preact/hooks';
import { t } from '../../i18n';
import { href } from '../../router';
import { useSettings } from '../../db/settings';
import { db, getKV } from '../../db/dexie';
import { loadGuides } from '../../content/loader';
import { AREAS, WEIGHTS, readiness, type Score } from '../../lib/readiness';

export function Readiness() {
  const s = useSettings();
  const [score, setScore] = useState<Score | null>(null);
  useEffect(() => {
    (async () => {
      const [rows, fam, hist, { guides }] = await Promise.all([
        db.checklists.toArray().catch(() => []), getKV<any>('familyPlan', null), db.history.toArray().catch(() => []), loadGuides(),
      ]);
      const vital = guides.filter((g) => g.vital);
      const read = new Set(hist.map((h) => h.id));
      const p = s.profile;
      setScore(readiness({
        needs: { people: p.people, days: 3, kids: p.kids, elderly: p.elderly, pets: p.pets },
        done: new Set(rows.filter((r) => r.done).map((r) => r.key)),
        hasFamilyPlan: !!fam && (fam.contacts?.length > 0 || !!fam.near),
        vitalTotal: vital.length, vitalRead: vital.filter((g) => read.has(g.id)).length,
      }));
    })();
  }, [s.profile, s.locale, s.dev]);
  if (!score) return <main><p>{t('app.loading')}</p></main>;
  return (
    <main class="stack">
      <h1>{t('score.title')}</h1>
      <p class="muted">{t('score.hint')}</p>
      <div class="card"><div class="big-num">{score.total}/100</div><progress max="100" value={score.total} style="inline-size:100%" aria-label={t('score.title')} /></div>
      {score.next && (
        <div class="card stack"><h2>{t('score.next')}</h2>
          <p>{score.next.itemId ? `${t(`score.area.${score.next.area}`)}: ${score.next.itemId === 'familyplan' ? t('prepare.family') : t(`kit.item.${score.next.itemId}`)}` : t(`score.area.${score.next.area}`)}</p>
          <a class="btn" href={score.next.area === 'knowledge' ? href('guides') : score.next.itemId === 'familyplan' ? href('prepare', 'family') : href('prepare', 'kit', '72h')}>{t('score.open')}</a></div>
      )}
      <ul class="list">{AREAS.map((a) => <li class="card"><div class="row"><span style="flex:1">{t(`score.area.${a}`)} · {WEIGHTS[a]}%</span><strong>{score.areas[a]}%</strong></div>
        <progress max="100" value={score.areas[a]} style="inline-size:100%" aria-label={t(`score.area.${a}`)} /></li>)}</ul>
      <p class="muted">{t('score.weights')}</p>
    </main>
  );
}
