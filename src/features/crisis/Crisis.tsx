import { useEffect, useState } from 'preact/hooks';
import { t } from '../../i18n';
import { getKV, setKV, db } from '../../db/dexie';
import { getSettings, updateSettings, useSettings } from '../../db/settings';
import { batteryHoursLeft, STAGES, SCENARIOS, SCENARIO_GUIDE, stageFor, summarize, type CrisisState, type Sample, type ScenarioKey } from '../../lib/crisis';
import { dayNumber } from '../../lib/clock';
import { href } from '../../router';
import { plan, checkKey } from '../../data/kits';
import { getGuide } from '../../content/loader';
import type { Guide } from '../../content/types';
import { tzOf, useNow } from '../almanac/shared';

const KEY = 'crisis';
export const loadCrisis = () => getKV<CrisisState | null>(KEY, null);

export function Crisis() {
  const s = useSettings();
  const now = useNow(30000);
  const [c, setC] = useState<CrisisState | null | undefined>(undefined);
  const [text, setText] = useState('');
  const [samples, setSamples] = useState<Sample[]>([]);
  const [level, setLevel] = useState<number | null>(null);
  const [guide, setGuide] = useState<Guide | undefined>();
  const [missing, setMissing] = useState<string[] | null>(null);
  useEffect(() => { loadCrisis().then(setC); }, []);
  useEffect(() => {
    if (!c) return;
    getGuide(SCENARIO_GUIDE[c.scenario]).then(setGuide);
    let off = false; let bat: any;
    const read = () => { if (off || !bat) return; setLevel(bat.level); setSamples((a) => [...a.slice(-120), { t: Date.now(), level: bat.level }]); };
    (navigator as any).getBattery?.().then((b: any) => { bat = b; read(); }).catch(() => {});
    const id = setInterval(read, 60000);
    return () => { off = true; clearInterval(id); };
  }, [c?.scenario, c?.start]);

  const start = (scenario: ScenarioKey) => {
    const st: CrisisState = { scenario, start: Date.now(), diary: [], prevBattery: getSettings().battery };
    setC(st); void setKV(KEY, st); updateSettings({ battery: true }); // battery saver: no animations, no updates
  };
  const addEntry = () => {
    if (!c || !text.trim()) return;
    const n = { ...c, diary: [{ at: Date.now(), text: text.trim() }, ...c.diary] };
    setC(n); setText(''); void setKV(KEY, n);
  };
  const end = async () => {
    if (!c) return;
    const done = new Set((await db.checklists.toArray().catch(() => [])).filter((x) => x.done).map((x) => x.key));
    const p = s.profile;
    setMissing(plan('72h', { people: p.people, days: 3, kids: p.kids, elderly: p.elderly, pets: p.pets })
      .filter((x) => !done.has(checkKey('72h', x.item.id))).map((x) => t(`kit.item.${x.item.id}`)));
    updateSettings({ battery: c.prevBattery });
  };
  const close = () => { setC(null); setMissing(null); void setKV(KEY, null); };

  if (c === undefined) return <main><p>{t('app.loading')}</p></main>;
  if (!c) {
    return (
      <main class="stack">
        <h1>{t('crisis.title')}</h1>
        <p>{t('crisis.intro')}</p>
        <ul class="list">{SCENARIOS.map((k) => <li><button class="btn-block" onClick={() => start(k)}>{t(`scenario.${k}`)}</button></li>)}</ul>
      </main>
    );
  }
  const elapsed = now - c.start;
  const stage = stageFor(elapsed);
  const hrs = batteryHoursLeft(samples);
  if (missing) {
    const sm = summarize(c, now);
    return (
      <main class="stack">
        <h1>{t('crisis.summary')}</h1>
        <p>{t('crisis.summary.text', { d: sm.days, h: sm.hours, n: sm.entries })}</p>
        <h2>{t('crisis.restock')}</h2>
        {missing.length ? <ul>{missing.map((m) => <li>{m}</li>)}</ul> : <p class="muted">{t('common.empty')}</p>}
        <h2>{t('crisis.diary')}</h2>
        <ul class="list">{c.diary.map((d) => <li class="card">{new Date(d.at).toLocaleString(s.locale)}: {d.text}</li>)}</ul>
        <button class="btn-block btn-danger" onClick={close}>{t('common.close')}</button>
      </main>
    );
  }
  return (
    <main class="stack">
      <h1>{t(`scenario.${c.scenario}`)}</h1>
      <div class="card">
        <div class="big-num">{t('counter.day', { n: dayNumber(c.start, now, tzOf(s)) })}</div>
        <div class="muted">{t('counter.elapsed', { d: Math.floor(elapsed / 86400e3), h: Math.floor((elapsed % 86400e3) / 3600e3), m: Math.floor((elapsed % 3600e3) / 60e3) })}</div>
      </div>
      <div class="row">{STAGES.map((k) => <span class={`badge ${k === stage ? 'badge-warn' : ''}`} aria-current={k === stage ? 'step' : undefined}>{t(`stage.${k}`)}</span>)}</div>
      {guide?.timeline?.[stage]?.length ? <div class="card"><strong>{t(`stage.${stage}`)}</strong><ul>{guide.timeline[stage]!.map((x) => <li>{x}</li>)}</ul></div> : null}
      <a class="btn btn-block" href={href('guide', SCENARIO_GUIDE[c.scenario])}>{t('crisis.openguide')}</a>
      <a class="btn btn-block" href={href('prepare', 'kit', '72h')}>{t('crisis.checklist')}</a>
      <a class="btn btn-block" href={href('emergency')}>{t('nav.emergency')}</a>
      <section class="card stack">
        <h2>{t('crisis.battery')}</h2>
        {level === null ? <p class="muted">{t('crisis.battery.na')}</p> : <p>{Math.round(level * 100)}%{hrs !== null ? ` · ${t('crisis.battery.left', { h: hrs.toFixed(1) })}` : ''}</p>}
        <p class="muted">{t('crisis.saver')}</p>
      </section>
      <section class="card stack">
        <h2>{t('crisis.diary')}</h2>
        <input value={text} onInput={(e) => setText((e.target as HTMLInputElement).value)} placeholder={t('crisis.diary.ph')} aria-label={t('crisis.diary')} />
        <button onClick={addEntry}>{t('notes.add')}</button>
        <ul class="list">{c.diary.slice(0, 5).map((d) => <li class="muted">{new Date(d.at).toLocaleTimeString(s.locale, { timeStyle: 'short' })}: {d.text}</li>)}</ul>
      </section>
      <button class="btn-block" onClick={end}>{t('crisis.end')}</button>
    </main>
  );
}
