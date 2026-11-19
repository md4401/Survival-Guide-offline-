import { t } from '../../i18n';
import { FEATURES, LIMITS_BY_PLAN, type Area } from '../../data/plans';

const AREAS: Area[] = ['emergency', 'scenarios', 'firstaid', 'water', 'food', 'shelter', 'prepare', 'family', 'navigation', 'comms', 'almanac', 'learn', 'ai', 'tools', 'system'];
/** Informational only: no purchase, no prompts. Premium is off in this build. */
export function Plans() {
  return (
    <main class="stack">
      <h1>{t('plans.title')}</h1>
      <p class="danger-box">{t('plans.intro')}</p>
      {AREAS.map((a) => {
        const rows = FEATURES.filter((f) => f.area === a);
        return rows.length === 0 ? null : (
          <section class="card" key={a}><h2>{t(`plan.area.${a}`)}</h2>
            <ul class="list">{rows.map((f) => (
              <li><div class="row"><span style="flex:1">{t(`plan.f.${f.id}`)}</span>
                <span class={`badge ${f.plan !== 'free' ? 'badge-warn' : ''}`}>{t(`plans.${f.plan}`)}</span></div>
                <div class="muted">{f.vital ? `${t('plans.vital')} · ` : ''}{f.built ? t('plans.built') : t('plans.planned')}</div></li>))}</ul></section>
        );
      })}
      <section class="card"><h2>{t('plans.limits')}</h2>
        <table class="cal"><thead><tr><th /><th>{t('plans.free')}</th><th>{t('plans.premium')}</th></tr></thead>
          <tbody>{(Object.keys(LIMITS_BY_PLAN) as Array<keyof typeof LIMITS_BY_PLAN>).map((k) => <tr><td>{t(`plans.limit.${k}`)}</td><td>{LIMITS_BY_PLAN[k].free}</td><td>{Number.isFinite(LIMITS_BY_PLAN[k].premium) ? LIMITS_BY_PLAN[k].premium : t('plans.unlimited')}</td></tr>)}</tbody></table></section>
      <p class="muted">{t('plans.rules')}</p>
    </main>
  );
}
