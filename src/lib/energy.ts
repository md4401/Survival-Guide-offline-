// Energy budget: devices × watts × hours against a battery/source capacity. All numbers are entered by the user.
export interface Device { name: string; watts: number; hours: number }
export const mahToWh = (mAh: number, volts = 3.7) => (mAh * volts) / 1000;
export const dailyWh = (ds: Device[]) => ds.reduce((n, d) => n + Math.max(0, d.watts) * Math.max(0, d.hours), 0);
/** Usable energy = capacity × efficiency (conversion losses, ~85% for a power bank). Returns days of autonomy and each device's share. */
export function energyReport(ds: Device[], capacityWh: number, efficiency = 0.85) {
  const daily = dailyWh(ds), usable = Math.max(0, capacityWh) * efficiency;
  return { daily, usable, days: daily > 0 ? usable / daily : Infinity, shares: ds.map((d) => ({ name: d.name, wh: d.watts * d.hours, pct: daily ? (d.watts * d.hours) / daily : 0 })) };
}
