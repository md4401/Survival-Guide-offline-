export const SCENARIOS = ['blackout', 'storm', 'flood', 'fire', 'heatwave', 'coldwave', 'earthquake', 'lost'] as const;
export type ScenarioKey = (typeof SCENARIOS)[number];
export const SCENARIO_GUIDE: Record<ScenarioKey, string> = {
  blackout: 'scenario.blackout', storm: 'scenario.storm', flood: 'scenario.flood', fire: 'scenario.house-fire',
  heatwave: 'scenario.heatwave', coldwave: 'scenario.coldwave', earthquake: 'scenario.earthquake', lost: 'scenario.lost',
};

export const STAGES = ['10min', '1h', '24h', '72h', '7d', '30d'] as const;
export type Stage = (typeof STAGES)[number];
const LIMITS_MS: Array<[Stage, number]> = [['10min', 10 * 60e3], ['1h', 3600e3], ['24h', 24 * 3600e3], ['72h', 72 * 3600e3], ['7d', 7 * 86400e3]];
/** The timeline stage the user is currently in (spec §5.2: 10 min, 1 h, 24 h, 72 h, 7 days, 30+ days). */
export function stageFor(elapsedMs: number): Stage {
  for (const [s, lim] of LIMITS_MS) if (elapsedMs < lim) return s;
  return '30d';
}

export interface Sample { t: number; level: number } // level 0..1
/** Hours of battery left, from the discharge rate over recent samples. null if not discharging / not enough data. */
export function batteryHoursLeft(samples: Sample[], windowMs = 3 * 3600e3): number | null {
  if (samples.length < 2) return null;
  const last = samples[samples.length - 1];
  const recent = samples.filter((s) => last.t - s.t <= windowMs);
  const first = recent[0];
  const dt = (last.t - first.t) / 3600e3, drop = first.level - last.level;
  if (dt < 0.05 || drop <= 0) return null;
  return last.level / (drop / dt);
}

export interface CrisisState { scenario: ScenarioKey; start: number; diary: Array<{ at: number; text: string }>; prevBattery: boolean }
export interface Summary { days: number; hours: number; entries: number }
export function summarize(c: CrisisState, endMs: number): Summary {
  const ms = Math.max(0, endMs - c.start);
  return { days: Math.floor(ms / 86400e3), hours: Math.floor((ms % 86400e3) / 3600e3), entries: c.diary.length };
}
