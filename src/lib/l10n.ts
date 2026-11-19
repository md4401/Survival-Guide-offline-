/** Content objects carry text per language; English is the fallback. (Content data, not UI strings: UI text uses i18n keys.) */
export type L = Partial<Record<string, string>> & { en: string };
export const pick = (o: L, locale: string) => o[locale] ?? o.en;
