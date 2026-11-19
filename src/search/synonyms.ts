// Plain lookup groups (no facts): any term in a group also matches the others. Accent-insensitive.
const GROUPS: Record<string, string[][]> = {
  en: [['light', 'flashlight', 'torch', 'lamp'], ['power', 'electricity', 'blackout', 'outage'], ['water', 'drink', 'drinking'], ['filter', 'purify', 'purification'], ['tent', 'camp', 'camping', 'campsite']],
  pt: [['luz', 'lanterna', 'lampada'], ['energia', 'eletricidade', 'apagao', 'blackout'], ['agua', 'potavel', 'beber'], ['filtro', 'purificar', 'purificacao'], ['barraca', 'acampamento', 'camping']],
};
export const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
export function expand(lang: string, query: string): string {
  const groups = (GROUPS[lang] ?? []).map((g) => g.map(norm));
  const terms = norm(query).split(/\s+/).filter(Boolean);
  const out = new Set(terms);
  for (const t of terms) for (const g of groups) if (g.includes(t)) g.forEach((x) => out.add(x));
  return [...out].join(' ');
}
