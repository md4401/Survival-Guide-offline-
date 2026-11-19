// Plain lookup groups (no facts): any term in a group also matches the others. Accent-insensitive.
const GROUPS: Record<string, string[][]> = {
  en: [['light', 'flashlight', 'torch', 'lamp', 'power', 'electricity', 'blackout', 'outage'], ['water', 'drink', 'drinking'], ['filter', 'purify', 'purification'], ['tent', 'camp', 'camping', 'campsite']],
  pt: [['luz', 'lanterna', 'lampada', 'energia', 'eletricidade', 'apagao', 'blackout'], ['agua', 'potavel', 'beber'], ['filtro', 'purificar', 'purificacao'], ['barraca', 'acampamento', 'camping']],
};
// Function words that match almost every guide and drown out the real topic (accent-folded).
const STOP: Record<string, string> = {
  en: 'a an and are as at be but by can could do does for from have how i if in is it its me my of on or should so than that the then there this to was we what when where which who why will with you your day days two one three hour hours week weeks',
  pt: 'a ao aos as com como da das de do dos e em eu essa esse esta este foi ha isso la mais me meu minha na nas no nos o os ou para por pra qual quando que se sem ser sua seu so um uma uns umas voce posso devo fazer estou esta dia dias dois um tres hora horas semana semanas',
};
export const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
export function expand(lang: string, query: string): string {
  const groups = (GROUPS[lang] ?? []).map((g) => g.map(norm));
  const all = norm(query).split(/[^a-z0-9]+/).filter(Boolean);
  const stop = new Set((STOP[lang] ?? '').split(' '));
  const kept = all.filter((w) => !stop.has(w));
  const terms = kept.length ? kept : all; // a question made only of function words keeps them
  const out = new Set(terms);
  for (const t of terms) for (const g of groups) if (g.includes(t)) g.forEach((x) => out.add(x));
  return [...out].join(' ');
}
