// Food stock: how many days it lasts for N people. kcal per unit are entered by the user (no food table is shipped); the daily need is a placeholder to review.
export interface StockItem { name: string; qty: number; kcalPerUnit: number }
export const KCAL_PER_PERSON_DAY = 2000; // placeholder planning value: needs review
export function totalKcal(items: StockItem[]) { return items.reduce((n, i) => n + Math.max(0, i.qty) * Math.max(0, i.kcalPerUnit), 0); }
export function stockReport(items: StockItem[], people: number, targetDays: number, need = KCAL_PER_PERSON_DAY) {
  const daily = Math.max(1, people) * need, total = totalKcal(items);
  const days = total / daily, required = daily * targetDays;
  return { total, daily, days, required, deficit: Math.max(0, required - total), enough: total >= required };
}
/** Eat the perishable first: the user marks it; this just orders items so a smaller kcal stock is shown last. */
export const byKcalDesc = (items: StockItem[]) => [...items].sort((a, b) => b.qty * b.kcalPerUnit - a.qty * a.kcalPerUnit);
